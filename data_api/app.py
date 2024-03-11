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
cors = CORS(app)

# Configura el tiempo de expiración del JWT
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=1)
SECRET_KEY = 'your-secret-key'
JWT_ALGORITHM = 'HS256'

Client_id = "c52a2b6341f080de4773"
Client_secret="b3ff0aec8649b12d0d026d7a332abdf416010133"

#Function to check if the token is valid
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

        user = User(**user_data.__dict__)
        db.session.add_all(user)
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

@cross_origin
@app.route('/github_callback', methods=['POST'])
def github_callback():
    data = {
        'client_id': Client_id,
        'client_secret': Client_secret,
        'code': request.json['code']
    }
    token_response = requests.post('https://github.com/login/oauth/access_token', data=data)
    access_token = token_response.text.split('=')[1].split('&')[0]  # Obtener el valor de access_token del texto de la respuesta
    github_client = Github(access_token)
    user = github_client.get_user()
    emails = user.get_emails()
    for email in emails:
        return jsonify({'succes': True,'access_token': create_token(email.email)})

@cross_origin
@app.route('/cards', methods=['POST'])
def get_cards():
    cards = [
        {
            'userFullName': 'John Doe',
            'userName': 'johndoe',
            'avatarUrl': 'https://github.com/RaulCDev.png',
            'content': 'This is a sample card content.This is a sample card content.This is a sample card content.This is a sample card content.This is a sample card content.This is a sample card content.This is a sample card content.',
        } for i in range(10)
    ]
    response = make_response(jsonify(cards))
    print(response)
    return response

@cross_origin
@app.route('/like', methods=['POST'])
def give_like():
    return "Mondongo";

@cross_origin
@app.route('/register', methods=['POST'])
def register_user():
    email = request.json['email']
    username = request.json['username']
    password = request.json['password']

    # Search if the user already exists
    existing_email = User.query.filter_by(email=email).first()

    if existing_email:
        # The user already exists
        return jsonify({"message": "El correo ya esta registrado", "success": False})
    else:
        # Create a new instance of the User model
        new_user = User(email=email, username=username, password=password)

        # Save the new user in the database
        db.session.add(new_user)
        db.session.commit()

        # Return a response with a success message
        return jsonify({"message": "Usuario registrado exitosamente", "success": True})



#Create a token JWT whit the user identity
def create_token(identity):
    #expires_delta = timedelta(minutes=60)  # Establece la duración de expiración del token
    #expires = datetime.now(timezone.utc) + expires_delta

    payload = {
        "identity": identity,
        #"exp": expires,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Insert predefined posts in the database
        insert_predefined_data()
    app.run(debug=True)