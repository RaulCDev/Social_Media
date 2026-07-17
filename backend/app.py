from datetime import datetime, timedelta, timezone

from flask import Flask, g, request, jsonify, make_response, redirect
from flask_cors import CORS
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError

import os
import hmac
#Import SQL database models from models.py and the database itself from database.py
from auth import issue_user_session, require_jwt
from demo_data import DEMO_POSTS, DEMO_USERS
from moderation import require_moderator
from rate_limits import reserve_session_ip, reserve_write
from SQL.database import db
from SQL.models import ContentReport, Like, Post, RateLimitBucket, RevokedToken, User
from github_oauth import (
    OAuthError,
    build_authorization_request,
    exchange_code,
    fetch_github_identity,
    upsert_github_user,
)

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'change-me')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://user:1234@db-mysql:3306/socialmedia')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '')
app.config['JWT_ALGORITHM'] = os.getenv('JWT_ALGORITHM', 'HS256')
app.config['JWT_ACCESS_MINUTES'] = int(os.getenv('JWT_ACCESS_MINUTES', '60'))
app.config['APP_ENV'] = os.getenv('APP_ENV', 'development').lower()
app.config['FRONTEND_ORIGINS'] = [
    origin.strip()
    for origin in os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000').split(',')
    if origin.strip()
]
app.config['COOKIE_SECURE'] = os.getenv('COOKIE_SECURE', 'false').lower() in ('1', 'true', 'yes')
app.config['GITHUB_CLIENT_ID'] = os.getenv('GITHUB_CLIENT_ID', '')
app.config['GITHUB_CLIENT_SECRET'] = os.getenv('GITHUB_CLIENT_SECRET', '')
app.config['GITHUB_CALLBACK_URL'] = os.getenv(
    'GITHUB_CALLBACK_URL', 'http://localhost:5000/auth/github/callback'
)
app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
app.config['POST_RATE_LIMIT'] = int(os.getenv('POST_RATE_LIMIT', '5'))
app.config['POST_RATE_WINDOW_SECONDS'] = int(os.getenv('POST_RATE_WINDOW_SECONDS', '60'))
app.config['COMMENT_RATE_LIMIT'] = int(os.getenv('COMMENT_RATE_LIMIT', '20'))
app.config['COMMENT_RATE_WINDOW_SECONDS'] = int(os.getenv('COMMENT_RATE_WINDOW_SECONDS', '60'))
app.config['POST_JTI_RATE_LIMIT'] = None
app.config['POST_IP_RATE_LIMIT'] = int(os.getenv('POST_IP_RATE_LIMIT', '20'))
app.config['COMMENT_JTI_RATE_LIMIT'] = None
app.config['COMMENT_IP_RATE_LIMIT'] = int(os.getenv('COMMENT_IP_RATE_LIMIT', '60'))
app.config['LIKE_RATE_LIMIT'] = int(os.getenv('LIKE_RATE_LIMIT', '30'))
app.config['LIKE_JTI_RATE_LIMIT'] = None
app.config['LIKE_IP_RATE_LIMIT'] = int(os.getenv('LIKE_IP_RATE_LIMIT', '100'))
app.config['WRITE_RATE_WINDOW_SECONDS'] = int(os.getenv('WRITE_RATE_WINDOW_SECONDS', '60'))
app.config['SESSION_IP_RATE_LIMIT'] = int(os.getenv('SESSION_IP_RATE_LIMIT', '10'))
app.config['SESSION_RATE_WINDOW_SECONDS'] = int(os.getenv('SESSION_RATE_WINDOW_SECONDS', '60'))
# Initialize the database
db.init_app(app)

if not app.config['FRONTEND_ORIGINS'] or '*' in app.config['FRONTEND_ORIGINS']:
    raise RuntimeError('FRONTEND_ORIGIN must contain explicit origins')
if app.config['APP_ENV'] == 'production' and any(
    not origin.startswith('https://') for origin in app.config['FRONTEND_ORIGINS']
):
    raise RuntimeError('Production FRONTEND_ORIGIN entries must use HTTPS')

# Inicializa la extensión CORS
CORS(
    app,
    resources={r'/*': {'origins': app.config['FRONTEND_ORIGINS']}},
    supports_credentials=True,
)

# Configura el tiempo de expiración del JWT
# HISTORICAL GITHUB LOGIN (DISABLED)
# from github import Github
# import requests
# Client_id = os.getenv('GITHUB_CLIENT_ID', '')
# Client_secret = os.getenv('GITHUB_CLIENT_SECRET', '')

def insert_predefined_data():
    demo_users_by_email = {}

    for user_data in DEMO_USERS:
        user = User.query.filter_by(email=user_data['email']).first()
        if user is None:
            user = User(
                email=user_data['email'],
                username=user_data['username'],
                accountname=user_data['accountname'],
                avatarUrl=user_data['avatar_url'],
                access_token=None,
            )
            db.session.add(user)
        demo_users_by_email[user_data['email']] = user

    db.session.flush()

    for post_data in DEMO_POSTS:
        user = demo_users_by_email[post_data['user_email']]
        existing_post = Post.query.filter_by(
            user_id=user.id,
            content=post_data['content'],
        ).first()
        if existing_post is None:
            db.session.add(Post(user_id=user.id, content=post_data['content']))

    db.session.commit()


@app.cli.command('init-db')
def init_db_command():
    """Create local development tables explicitly."""
    db.create_all()


@app.cli.command('seed-demo')
def seed_demo_command():
    """Create tables and insert demonstration data explicitly."""
    db.create_all()
    insert_predefined_data()


def _public_identity(user):
    return {
        'id': user.id,
        'username': user.username,
        'accountname': user.accountname,
        'is_guest': user.is_guest,
    }


def _json_object():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def _validated_content(data):
    content = data.get('content')
    if not isinstance(content, str):
        return None

    content = content.strip()
    if not content or len(content) > 280:
        return None
    return content


def _validated_post_id(data):
    post_id = data.get('postId')
    if isinstance(post_id, bool) or not isinstance(post_id, int) or post_id <= 0:
        return None
    return post_id


def _reserve_rate_limit_slot(
    session,
    *,
    user_id,
    action,
    limit,
    window_seconds,
    now=None,
):
    """Atomically reserve one identity/action slot in a fixed DB window."""
    if limit <= 0 or window_seconds <= 0:
        return False

    now = now or datetime.now(timezone.utc).replace(tzinfo=None)
    epoch_seconds = int(now.timestamp())
    window_start = datetime.fromtimestamp(
        epoch_seconds - (epoch_seconds % window_seconds), timezone.utc
    ).replace(tzinfo=None)
    bucket = RateLimitBucket(
        user_id=user_id,
        action=action,
        window_start=window_start,
        request_count=1,
    )
    session.add(bucket)
    try:
        session.commit()
        return True
    except IntegrityError:
        session.rollback()

    result = session.execute(
        update(RateLimitBucket)
        .where(
            RateLimitBucket.user_id == user_id,
            RateLimitBucket.action == action,
            RateLimitBucket.window_start == window_start,
            RateLimitBucket.request_count < limit,
        )
        .values(request_count=RateLimitBucket.request_count + 1)
    )
    session.commit()
    return result.rowcount == 1


def _reserve_rate_limit(user_id, *, comments):
    if comments:
        limit = app.config['COMMENT_RATE_LIMIT']
        window_seconds = app.config['COMMENT_RATE_WINDOW_SECONDS']
        action = 'comment'
    else:
        limit = app.config['POST_RATE_LIMIT']
        window_seconds = app.config['POST_RATE_WINDOW_SECONDS']
        action = 'post'

    return _reserve_rate_limit_slot(
        db.session,
        user_id=user_id,
        action=action,
        limit=limit,
        window_seconds=window_seconds,
    )


def _oauth_error_response(code):
    response = redirect(f"{app.config['FRONTEND_URL']}/?oauth_error={code}")
    return _clear_oauth_cookies(response)


def _clear_oauth_cookies(response):
    for name in ('oauth_state', 'oauth_code_verifier'):
        response.delete_cookie(
            name,
            httponly=True,
            secure=app.config['COOKIE_SECURE'],
            samesite='Lax',
            path='/auth/github',
        )
    return response


@app.route('/auth/github/start', methods=['GET'])
def github_start():
    required = (
        app.config['GITHUB_CLIENT_ID'],
        app.config['GITHUB_CLIENT_SECRET'],
        app.config['GITHUB_CALLBACK_URL'],
        app.config['JWT_SECRET_KEY'],
    )
    if not all(required):
        return jsonify({'message': 'GitHub authentication is not configured'}), 503
    if not reserve_session_ip():
        return jsonify({'message': 'Rate limit exceeded'}), 429

    authorization_url, state, verifier = build_authorization_request(
        app.config['GITHUB_CLIENT_ID'], app.config['GITHUB_CALLBACK_URL']
    )
    response = redirect(authorization_url)
    for name, value in (
        ('oauth_state', state),
        ('oauth_code_verifier', verifier),
    ):
        response.set_cookie(
            name,
            value,
            max_age=600,
            httponly=True,
            secure=app.config['COOKIE_SECURE'],
            samesite='Lax',
            path='/auth/github',
        )
    return response


@app.route('/auth/github/callback', methods=['GET'])
def github_callback():
    if request.args.get('error'):
        return _oauth_error_response('access_denied')

    code = request.args.get('code')
    returned_state = request.args.get('state')
    expected_state = request.cookies.get('oauth_state')
    verifier = request.cookies.get('oauth_code_verifier')
    if not all((code, returned_state, expected_state, verifier)):
        return _oauth_error_response('invalid_request')
    if not hmac.compare_digest(returned_state, expected_state):
        return _oauth_error_response('invalid_state')

    try:
        github_token = exchange_code(
            client_id=app.config['GITHUB_CLIENT_ID'],
            client_secret=app.config['GITHUB_CLIENT_SECRET'],
            callback_url=app.config['GITHUB_CALLBACK_URL'],
            code=code,
            verifier=verifier,
        )
        identity = fetch_github_identity(github_token)
        user = upsert_github_user(identity)
        token = issue_user_session(user)
    except OAuthError as exc:
        return _oauth_error_response(exc.code)

    response = redirect(f"{app.config['FRONTEND_URL']}/home")
    response.set_cookie(
        'access_token',
        token,
        max_age=app.config['JWT_ACCESS_MINUTES'] * 60,
        httponly=True,
        secure=app.config['COOKIE_SECURE'],
        samesite='Lax',
        path='/',
    )
    return _clear_oauth_cookies(response)


@app.route('/auth/me', methods=['GET'])
@require_jwt
def current_session():
    return jsonify(_public_identity(g.current_user))


@app.route('/auth/logout', methods=['POST'])
@require_jwt
def logout():
    db.session.add(RevokedToken(jti=g.jwt_payload['jti']))
    db.session.commit()
    response = make_response('', 204)
    response.delete_cookie(
        'access_token',
        httponly=True,
        secure=app.config['COOKIE_SECURE'],
        samesite='Lax',
        path='/',
    )
    return response


# HISTORICAL GITHUB LOGIN (DISABLED)
# The original save_user helper, /github_callback route and create_token helper
# are preserved below as comments for archaeology only. They must not be enabled
# without a separate, explicitly approved authentication design.
# def save_user(email, username, accountname, avatarUrl, token):
#     user = User.query.filter_by(email=email).first()
#     if user:
#         user.access_token = token
#         db.session.commit()
#         return {'success': True}
#     new_user = User(
#         email=email,
#         username=username,
#         accountname=accountname,
#         avatarUrl=avatarUrl,
#         access_token=token,
#     )
#     db.session.add(new_user)
#     db.session.commit()
#     return {'success': True}
#
# @cross_origin
# @app.route('/get_user_data', methods=['POST'])
# @jwt_required
# def get_user():
#     token = request.headers.get('Authorization').split(' ')[1]
#     print(token)
#     user = User.query.filter_by(access_token=token).first()
#     if not user:
#         print("User not found")
#         return jsonify({"message": "User not found"}), 404
#     return jsonify({
#         'email': user.email,
#         'username': user.username,
#         'accountname': user.accountname,
#         'avatarUrl': user.avatarUrl,
#     })
#
# @cross_origin
# @app.route('/github_callback', methods=['POST'])
# def github_callback():
#     data = {
#         'client_id': Client_id,
#         'client_secret': Client_secret,
#         'code': request.json['code'],
#     }
#     token_response = requests.post(
#         'https://github.com/login/oauth/access_token', data=data
#     )
#     access_token = token_response.text.split('=')[1].split('&')[0]
#     github_client = Github(access_token)
#     user = github_client.get_user()
#     emails = user.get_emails()
#     for email in emails:
#         email_value = email.email
#         username_value = user.login
#         avatarUrl_value = f"https://github.com/{user.login}.png"
#         token = create_token(email.email)
#         print(token)
#         save_user(
#             email_value, username_value, username_value, avatarUrl_value, token
#         )
#         return jsonify({'succes': True, 'access_token': token})


@app.route('/comment', methods=['POST'])
@require_jwt
def comment():
    data = _json_object()
    if data is None:
        return jsonify({'message': 'Invalid JSON'}), 400

    content = _validated_content(data)
    if content is None:
        return jsonify({'message': 'Content must be a non-empty string of at most 280 characters'}), 400

    post_id = _validated_post_id(data)
    if post_id is None:
        return jsonify({'message': 'Post ID must be a positive integer'}), 400

    post = Post.query.filter_by(id=post_id, is_hidden=False).first()
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    if not reserve_write('comment', g.jwt_payload['jti']):
        return jsonify({'message': 'Rate limit exceeded'}), 429

    comment = Post(user_id=g.current_user.id, content=content, father_id=post_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({'message': 'Comment posted successfully'}), 201




@app.route('/cards', methods=['POST'])
def get_cards():
    posts = Post.query.filter(
        Post.father_id.is_(None), Post.is_hidden.is_(False)
    ).order_by(Post.timestamp.desc()).limit(10).all()

    posts_list = []
    for post in posts:
        likes_amount = Like.query.filter_by(post_id=post.id).count()

        post.views_amount += 1
        db.session.commit()

        comments_amount = Post.query.filter_by(father_id=post.id, is_hidden=False).count()

        posts_list.append({
            'id': post.id,
            'userFullName': post.user.accountname,
            'userName': post.user.username,
            'avatarUrl': post.user.avatarUrl,
            'content': post.content,
            'likes': likes_amount,
            'views': post.views_amount,
            'comments': comments_amount,
            'isLiked': False
        })

    response = make_response(jsonify(posts_list))
    return response



@app.route('/like', methods=['POST'])
@require_jwt
def give_like():
    request_data = _json_object()
    if request_data is None:
        return jsonify({'message': 'Invalid JSON'}), 400

    post_id = _validated_post_id(request_data)
    if post_id is None:
        return jsonify({'message': 'Post ID must be a positive integer'}), 400
    if Post.query.filter_by(id=post_id, is_hidden=False).first() is None:
        return jsonify({'message': 'Post not found'}), 404

    if not reserve_write('like', g.jwt_payload['jti']):
        return jsonify({'message': 'Rate limit exceeded'}), 429

    existing = Like.query.filter_by(post_id=post_id, user_id=g.current_user.id).first()
    if existing is not None:
        return jsonify({'message': 'Like saved successfully'}), 200

    like = Like(post_id=post_id, user_id=g.current_user.id)
    db.session.add(like)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        duplicate = Like.query.filter_by(
            post_id=post_id,
            user_id=g.current_user.id,
        ).first()
        if duplicate is None:
            return jsonify({'message': 'Unable to save like'}), 500

    return jsonify({'message': 'Like saved successfully'}), 200


@app.route('/profileData', methods=['POST'])
def profileData():
    user_name = request.json.get('user_name')

    if not user_name:
        return jsonify({'error': 'That user does not exist'}), 400

    user = User.query.filter_by(username=user_name).first()

    if not user:
        return jsonify({'error': 'That user does not exist'}), 400

    post_count = Post.query.filter_by(user_id=user.id, is_hidden=False).count()

    return jsonify({'post_count': post_count})


@app.route('/postCards', methods=['POST'])
def postCards():
    postId = request.json

    if not postId:
        return jsonify({'error': 'Missing post ID'}), 400

    post_id = postId['post_id']

    post = Post.query.filter_by(id=post_id, is_hidden=False).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    comments = []

    post_comments = Post.query.filter_by(father_id=post_id, is_hidden=False).all()
    for comment in post_comments:
        comment_data = {
            'id': comment.id,
            'userFullName': comment.user.accountname,
            'userName': comment.user.username,
            'avatarUrl': comment.user.avatarUrl,
            'content': comment.content,
            'likes_amount': comment.count_likes(),
            'views_amount': comment.views_amount,
            'comments_amount': comment.count_comments(),
            'isLiked': False
        }
        comments.append(comment_data)


    comments_amount = post.count_comments()
    likes_amount = post.count_likes()
    views_amount = post.views_amount
    postData = {
        'id': post.id,
        'userFullName': post.user.accountname,
        'userName': post.user.username,
        'avatarUrl': post.user.avatarUrl,
        'content': post.content,
        "comments_amount": comments_amount,
        "likes_amount": likes_amount,
        "views_amount": views_amount,
        "isLiked": False,
        "comments": comments
    }

    return jsonify(postData)


@app.route('/postData', methods=['POST'])
def postData():
    postId = request.json

    if not postId:
        return jsonify({'error': 'Missing post ID'}), 400

    post = Post.query.filter_by(id=postId, is_hidden=False).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    postData = {
        'id': post.id,
        'userFullName': post.user.accountname,
        'userName': post.user.username,
        'avatarUrl': post.user.avatarUrl,
        'content': post.content,
    }

    return jsonify(postData)


@app.route('/unlike', methods=['POST'])
@require_jwt
def remove_like():
    request_data = _json_object()
    if request_data is None:
        return jsonify({'message': 'Invalid JSON'}), 400

    post_id = _validated_post_id(request_data)
    if post_id is None:
        return jsonify({'message': 'Post ID must be a positive integer'}), 400
    if Post.query.filter_by(id=post_id, is_hidden=False).first() is None:
        return jsonify({'message': 'Post not found'}), 404

    like = Like.query.filter_by(post_id=post_id, user_id=g.current_user.id).first()
    if like:
        db.session.delete(like)
        db.session.commit()

    return jsonify({'message': 'Like removed successfully'}), 200


@app.route('/trends', methods=['POST'])
def send_trends():
    trends_data = [
        { "number": 1, "category": "Gaming", "name": "Escape From Tarkov", "posts": "157.6K" },
        { "number": 2, "category": "", "name": "Happy Spring", "posts": "17.9K" },
        { "number": 3, "category": "", "name": "Scotland", "posts": "69.2K" },
        { "number": 4, "category": "Animation & Comics", "name": "Nickelodeon", "posts": "63.3K" },
        { "number": 5, "category": "Gaming", "name": "Bungie", "posts": "4,326" },
        { "number": 6, "category": "Technology", "name": "Nvidia", "posts": "78.2K" },
        { "number": 7, "category": "", "name": "Kojima", "posts": "6,916" },
        { "number": 8, "category": "", "name": "Japan", "posts": "28.3K" },
        { "number": 9, "category": "Gaming", "name": "Steam", "posts": "109K" },
        { "number": 10, "category": "Action & adventure films", "name": "James Bond", "posts": "28.7K" },
    ]
    return jsonify(trends_data)

@app.route('/users_recomendation', methods=['POST'])
def send_users_recomendation():
    users_data = [
        { "name": "user1", "username": "@user1", "src": "https://github.com/user1.png" },
        { "name": "user2", "username": "@user2", "src": "https://github.com/user2.png" },
        { "name": "user3", "username": "@user3", "src": "https://github.com/user3.png" },
    ]
    return jsonify(users_data)


@app.route('/post', methods=['POST'])
@require_jwt
def post():
    data = _json_object()
    if data is None:
        return jsonify({'message': 'Invalid JSON'}), 400

    content = _validated_content(data)
    if content is None:
        return jsonify({'message': 'Content must be a non-empty string of at most 280 characters'}), 400

    if not reserve_write('post', g.jwt_payload['jti']):
        return jsonify({'message': 'Rate limit exceeded'}), 429

    new_post = Post(user_id=g.current_user.id, content=content)

    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "Post created successfully"}), 201


@app.route('/reports', methods=['POST'])
@require_jwt
def report_content():
    data = _json_object()
    if data is None:
        return jsonify({'message': 'Invalid JSON'}), 400
    post_id = _validated_post_id(data)
    reason = data.get('reason')
    if post_id is None or not isinstance(reason, str) or not reason.strip() or len(reason.strip()) > 280:
        return jsonify({'message': 'Invalid report'}), 400
    if Post.query.filter_by(id=post_id, is_hidden=False).first() is None:
        return jsonify({'message': 'Post not found'}), 404
    existing = ContentReport.query.filter_by(
        reporter_id=g.current_user.id, post_id=post_id
    ).first()
    if existing is None:
        db.session.add(ContentReport(
            reporter_id=g.current_user.id,
            post_id=post_id,
            reason=reason.strip(),
        ))
        db.session.commit()
    return jsonify({'message': 'Report submitted'}), 201


@app.route('/moderation/reports', methods=['GET'])
@require_jwt
@require_moderator
def moderation_reports():
    reports = ContentReport.query.filter_by(status='open').all()
    return jsonify([
        {'id': item.id, 'postId': item.post_id, 'reason': item.reason}
        for item in reports
    ])


@app.route('/moderation/posts/<int:post_id>/hide', methods=['POST'])
@require_jwt
@require_moderator
def hide_post(post_id):
    post = db.session.get(Post, post_id)
    if post is None:
        return jsonify({'message': 'Post not found'}), 404
    post.is_hidden = True
    post.hidden_at = datetime.now(timezone.utc).replace(tzinfo=None)
    post.hidden_by = g.current_user.id
    db.session.commit()
    return jsonify({'message': 'Post hidden'}), 200


@app.route('/moderation/users/<int:user_id>/status', methods=['POST'])
@require_jwt
@require_moderator
def change_user_status(user_id):
    data = _json_object()
    status = data.get('status') if data else None
    if status not in {'active', 'suspended', 'blocked'}:
        return jsonify({'message': 'Invalid status'}), 400
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({'message': 'User not found'}), 404
    user.status = status
    db.session.commit()
    return jsonify({'message': 'User status updated'}), 200


# HISTORICAL GITHUB LOGIN (DISABLED)
# def create_token(identity):
#     expires_delta = timedelta(minutes=60)
#     expires = datetime.now(timezone.utc) + expires_delta
#     payload = {"identity": identity, "exp": expires}
#     return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('API_PORT', 5000)), debug=False)
