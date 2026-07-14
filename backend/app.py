from datetime import datetime, timedelta

from flask import Flask, g, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError

import os
#Import SQL database models from models.py and the database itself from database.py
from auth import issue_guest_session, require_jwt
from SQL.database import db
from SQL.models import Like, Post, RateLimitBucket, RevokedToken, User

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'change-me')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://user:1234@db-mysql:3306/socialmedia')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', '')
app.config['JWT_ALGORITHM'] = os.getenv('JWT_ALGORITHM', 'HS256')
app.config['JWT_ACCESS_MINUTES'] = int(os.getenv('JWT_ACCESS_MINUTES', '60'))
app.config['FRONTEND_ORIGIN'] = os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000')
app.config['COOKIE_SECURE'] = os.getenv('COOKIE_SECURE', 'false').lower() in ('1', 'true', 'yes')
app.config['POST_RATE_LIMIT'] = int(os.getenv('POST_RATE_LIMIT', '5'))
app.config['POST_RATE_WINDOW_SECONDS'] = int(os.getenv('POST_RATE_WINDOW_SECONDS', '60'))
app.config['COMMENT_RATE_LIMIT'] = int(os.getenv('COMMENT_RATE_LIMIT', '20'))
app.config['COMMENT_RATE_WINDOW_SECONDS'] = int(os.getenv('COMMENT_RATE_WINDOW_SECONDS', '60'))
# Initialize the database
db.init_app(app)

# Inicializa la extensión CORS
CORS(
    app,
    resources={r'/*': {'origins': [app.config['FRONTEND_ORIGIN']]}},
    supports_credentials=True,
)

# Configura el tiempo de expiración del JWT
# HISTORICAL GITHUB LOGIN (DISABLED)
# from github import Github
# import requests
# Client_id = os.getenv('GITHUB_CLIENT_ID', '')
# Client_secret = os.getenv('GITHUB_CLIENT_SECRET', '')

def insert_predefined_data():
    # Get the first user from the database
    user = User.query.with_entities(User.id, User.email, User.username, User.accountname, User.avatarUrl).first()

    # Create 10 predefined users
    users = [
        User(email='user1@example.com', username='user1', accountname='user1', avatarUrl='https://github.com/user1.png'),
        User(email='user2@example.com', username='user2', accountname='user2', avatarUrl='https://github.com/user2.png'),
        User(email='user3@example.com', username='user3', accountname='user3', avatarUrl='https://github.com/user3.png'),
        User(email='user4@example.com', username='user4', accountname='user4', avatarUrl='https://github.com/user4.png'),
        User(email='user5@example.com', username='user5', accountname='user5', avatarUrl='https://github.com/user5.png'),
        User(email='user6@example.com', username='user6', accountname='user6', avatarUrl='https://github.com/user6.png'),
        User(email='user7@example.com', username='user7', accountname='user7', avatarUrl='https://github.com/user7.png'),
        User(email='user8@example.com', username='user8', accountname='user8', avatarUrl='https://github.com/user8.png'),
        User(email='user9@example.com', username='user9', accountname='user9', avatarUrl='https://github.com/user9.png'),
        User(email='user10@example.com', username='user10', accountname='user10', avatarUrl='https://github.com/user10.png'),
    ]

    # Add the users to the database
    for user_data in users:
        existing_user = User.query.filter_by(email=user_data.email).first()
        if existing_user:
            continue

        user = User(
            email=user_data.email,
            username=user_data.username,
            accountname=user_data.accountname,
            avatarUrl=user_data.avatarUrl,
            access_token=None,
        )
        db.session.add(user)
        db.session.commit()

    # Create 10 predefined posts for each user
    users = User.query.all()
    for user in users:
        posts = []
        for i in range(10):
            post_data = Post(user_id=user.id, content='This is the first content')
            existing_post = Post.query.filter_by(user_id=user.id, content=post_data.content).first()
            if existing_post:
                continue

            posts.append(post_data)
            db.session.add(post_data)
            db.session.commit()


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

    now = now or datetime.utcnow()
    epoch_seconds = int(now.timestamp())
    window_start = datetime.utcfromtimestamp(
        epoch_seconds - (epoch_seconds % window_seconds)
    )
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


@app.route('/auth/guest', methods=['POST'])
def guest_session():
    if not app.config['JWT_SECRET_KEY']:
        return jsonify({'message': 'Authentication is not configured'}), 503

    user, token = issue_guest_session()
    response = make_response(jsonify({'user': _public_identity(user)}), 201)
    response.set_cookie(
        'access_token',
        token,
        httponly=True,
        secure=app.config['COOKIE_SECURE'],
        samesite='Lax',
        path='/',
    )
    return response


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

    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({'message': 'Post not found'}), 404

    if not _reserve_rate_limit(g.current_user.id, comments=True):
        return jsonify({'message': 'Rate limit exceeded'}), 429

    comment = Post(user_id=g.current_user.id, content=content, father_id=post_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({'message': 'Comment posted successfully'}), 201




@app.route('/cards', methods=['POST'])
def get_cards():
    posts = Post.query.filter(Post.father_id.is_(None)).order_by(Post.timestamp.desc()).limit(10).all()

    posts_list = []
    for post in posts:
        likes_amount = Like.query.filter_by(post_id=post.id).count()

        post.views_amount += 1
        db.session.commit()

        comments_amount = Post.query.filter_by(father_id=post.id).count()

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
    if db.session.get(Post, post_id) is None:
        return jsonify({'message': 'Post not found'}), 404

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


@cross_origin
@app.route('/profileData', methods=['POST'])
def profileData():
    user_name = request.json.get('user_name')

    if not user_name:
        return jsonify({'error': 'That user does not exist'}), 400

    user = User.query.filter_by(username=user_name).first()

    if not user:
        return jsonify({'error': 'That user does not exist'}), 400

    post_count = Post.query.filter_by(user_id=user.id).count()

    return jsonify({'post_count': post_count})


@cross_origin
@app.route('/postCards', methods=['POST'])
def postCards():
    postId = request.json

    if not postId:
        return jsonify({'error': 'Missing post ID'}), 400

    post_id = postId['post_id']

    post = Post.query.filter_by(id=post_id).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    comments = []

    post_comments = Post.query.filter_by(father_id=post_id).all()
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


@cross_origin
@app.route('/postData', methods=['POST'])
def postData():
    postId = request.json

    if not postId:
        return jsonify({'error': 'Missing post ID'}), 400

    post = Post.query.filter_by(id=postId).first()

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
    if db.session.get(Post, post_id) is None:
        return jsonify({'message': 'Post not found'}), 404

    like = Like.query.filter_by(post_id=post_id, user_id=g.current_user.id).first()
    if like:
        db.session.delete(like)
        db.session.commit()

    return jsonify({'message': 'Like removed successfully'}), 200


@cross_origin
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

@cross_origin
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

    if not _reserve_rate_limit(g.current_user.id, comments=False):
        return jsonify({'message': 'Rate limit exceeded'}), 429

    new_post = Post(user_id=g.current_user.id, content=content)

    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "Post created successfully"}), 201


# HISTORICAL GITHUB LOGIN (DISABLED)
# def create_token(identity):
#     expires_delta = timedelta(minutes=60)
#     expires = datetime.now(timezone.utc) + expires_delta
#     payload = {"identity": identity, "exp": expires}
#     return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Insert predefined posts in the database
        insert_predefined_data()
    app.run(host='0.0.0.0', port=int(os.getenv('API_PORT', 5000)), debug=True)
