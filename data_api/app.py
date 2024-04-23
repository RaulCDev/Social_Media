from flask import Flask, request, jsonify, url_for, make_response
from flask_cors import CORS, cross_origin
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from github import Github

import requests
#Import SQL database models from models.py and the database itself from database.py
from SQL.database import db
from SQL.models import Post, Like, User

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://user:1234@localhost:3306/socialmedia'
# Initialize the database
db.init_app(app)

# Inicializa la extensión CORS
CORS(app, resources={r'/*': {'origins': '*'}})
cors = CORS(app)

# Configura el tiempo de expiración del JWT
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=1)
SECRET_KEY = 'your-secret-key'
JWT_ALGORITHM = 'HS256'

Client_id = "c52a2b6341f080de4773"
Client_secret="b3ff0aec8649b12d0d026d7a332abdf416010133"


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"message": "Missing authorization header"}), 401

        try:
            auth_scheme, token = auth_header.split()
            if auth_scheme.lower() != "bearer":
                return jsonify({"message": "Invalid authorization scheme"}), 401
        except ValueError:
            return jsonify({"message": "Invalid authorization header"}), 401

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
            request.user = decoded_token["identity"]
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return fn(*args, **kwargs)

    return wrapper


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


def save_user(email, username, accountname, avatarUrl, token):
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'message': 'User already registered'})

    user = User(email=email, username=username, accountname=accountname, avatarUrl=avatarUrl, access_token=token)

    db.session.add(user)
    db.session.commit()

    return {'success': True}


@cross_origin
@app.route('/get_user_data', methods=['POST'])
@jwt_required
def get_user():
    auth_header = request.headers.get('Authorization').split(' ')[1]
    if not auth_header:
        return jsonify({"message": "Missing authorization header"}), 401

    try:
        auth_scheme, token = auth_header.split()
        if auth_scheme.lower() != "bearer":
            return jsonify({"message": "Invalid authorization scheme"}), 401
    except ValueError:
        return jsonify({"message": "Invalid authorization header"}), 401

    user = User.query.filter_by(access_token=token).first()

    return jsonify({
        'email': user.email,
        'username': user.username,
        'accountname': user.accountname,
        'avatarUrl': user.avatarUrl
    })


@cross_origin
@app.route('/github_callback', methods=['POST'])
def github_callback():
    data = {
        'client_id': Client_id,
        'client_secret': Client_secret,
        'code': request.json['code']
    }
    token_response = requests.post('https://github.com/login/oauth/access_token', data=data)
    access_token = token_response.text.split('=')[1].split('&')[0]
    github_client = Github(access_token)
    user = github_client.get_user()
    emails = user.get_emails()
    for email in emails:
        email_value = email.email
        username_value = user.login
        avatarUrl_value = f"https://github.com/{user.login}.png"
        token = create_token(email.email)
        save_user(email_value, username_value, username_value, avatarUrl_value, token)
        return jsonify({'succes': True,'access_token': token})


@cross_origin
@app.route('/comment', methods=['POST'])
def comment():
    data = request.json
    post_id = data.get('postId')
    content = data.get('content')

    if len(content) > 280:
        return jsonify({'error': 'Comment content exceeds the character limit of 280'}), 400

    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404

    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Missing authorization header"}), 401

    try:
        auth_scheme, token = auth_header.split()
        if auth_scheme.lower() != "bearer":
            return jsonify({"error": "Invalid authorization scheme"}), 401
    except ValueError:
        return jsonify({"error": "Invalid authorization header"}), 401

    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_identity = decoded_token["identity"]
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    user = User.query.filter_by(email=user_identity).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    comment = Post(user_id=user.id, content=content, father_id=post_id)
    db.session.add(comment)
    db.session.commit()

    return jsonify({'message': 'Comment posted successfully'})




@cross_origin
@app.route('/cards', methods=['POST'])
def get_cards():
    token = request.headers.get('Authorization').split(' ')[1]
    user_id = get_current_user(token)

    posts = Post.query.filter(Post.father_id.is_(None)).order_by(Post.timestamp.desc()).limit(10).all()

    posts_list = []
    for post in posts:
        likes_amount = Like.query.filter_by(post_id=post.id).count()

        post.views_amount += 1
        db.session.commit()

        comments_amount = Post.query.filter_by(father_id=post.id).count()

        is_liked = Like.query.filter_by(post_id=post.id, user_id=user_id).first() is not None

        posts_list.append({
            'id': post.id,
            'userFullName': post.user.accountname,
            'userName': post.user.username,
            'avatarUrl': post.user.avatarUrl,
            'content': post.content,
            'likes': likes_amount,
            'views': post.views_amount,
            'comments': comments_amount,
            'isLiked': is_liked
        })

    response = make_response(jsonify(posts_list))
    return response



@cross_origin
@app.route('/like', methods=['POST'])
def give_like():
    request_data = request.get_json()

    post_id = request_data.get('postId')
    if post_id is None:
        return jsonify({'error': 'Post ID is missing in the request data'}), 400

    try:
        token = request.headers.get('Authorization').split(' ')[1]
        user_id = get_current_user(token)
    except Exception as e:
        return jsonify({'error': 'Failed to extract user ID from authorization token', 'details': str(e)}), 400

    like = Like(post_id=post_id, user_id=user_id)
    db.session.add(like)
    db.session.commit()

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
            'isLiked': comment.is_liked_by_user(comment.user_id)
        }
        comments.append(comment_data)


    comments_amount = post.count_comments()
    likes_amount = post.count_likes()
    views_amount = post.views_amount
    is_liked = post.is_liked_by_user(post.user_id)

    postData = {
        'id': post.id,
        'userFullName': post.user.accountname,
        'userName': post.user.username,
        'avatarUrl': post.user.avatarUrl,
        'content': post.content,
        "comments_amount": comments_amount,
        "likes_amount": likes_amount,
        "views_amount": views_amount,
        "isLiked": is_liked,
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


@cross_origin
@app.route('/unlike', methods=['POST'])
def remove_like():
    request_data = request.get_json()
    post_id = request_data.get('postId')

    token = request.headers.get('Authorization').split(' ')[1]

    user_id = get_current_user(token)

    like = Like.query.filter_by(post_id=post_id, user_id=user_id).first()
    if like:
        db.session.delete(like)
        db.session.commit()

        return jsonify({'message': 'Like removed successfully'}), 200
    else:
        return jsonify({'error': 'Like not found'}), 404


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


@cross_origin
@app.route('/post', methods=['POST'])
def post():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"message": "Missing authorization header"}), 401

    try:
        auth_scheme, token = auth_header.split()
        if auth_scheme.lower() != "bearer":
            return jsonify({"message": "Invalid authorization scheme"}), 401
    except ValueError:
        return jsonify({"message": "Invalid authorization header"}), 401

    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_identity = decoded_token["identity"]
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401

    user = User.query.filter_by(email=user_identity).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    content = request.json.get('content')

    new_post = Post(user_id=user.id, content=content)

    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "Post created successfully"})



def get_current_user(token):
    user = User.query.filter_by(access_token=token).first()
    if user:
        return user.id
    else:
        return None


#Create a token JWT whit the user identity
def create_token(identity):
    expires_delta = timedelta(minutes=60)
    expires = datetime.now(timezone.utc) + expires_delta

    payload = {
        "identity": identity,
        "exp": expires,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Insert predefined posts in the database
        insert_predefined_data()
    app.run(debug=True)