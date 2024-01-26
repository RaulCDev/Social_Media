from flask import Flask, request, jsonify, url_for
from flask_cors import CORS, cross_origin
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from github import Github
import requests

#Import SQL database models from models.py and the database itself from database.py
from models import User
from database import db

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://user:1234@localhost:3306/socialmedia'
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
@app.route('/login', methods=['POST'])
def login_user():
    email = request.json['email']
    password = request.json['password']

    # Autentica al usuario
    user = authenticate(email, password)

    if user:
        # Genera el JWT para el usuario autenticado
        return jsonify({'succes': True,'access_token': create_token(user.email)})

    return jsonify({'message': 'Error de autenticación', 'success': False}), 40

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

@cross_origin
@app.route('/prueba', methods=['POST'])
@jwt_required
def name():

    return jsonify({"message": "Entro papi", "success": True})



#Create a token JWT whit the user identity
def create_token(identity):
    expires_delta = timedelta(minutes=60)  # Establece la duración de expiración del token
    expires = datetime.now(timezone.utc) + expires_delta

    payload = {
        "identity": identity,
        "exp": expires,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

# Check if the user exists, and the credentials are correct
def authenticate(email, password):
    user = User.query.filter_by(email=email).first()
    if user and user.password == password:  # Comparación de contraseñas en texto plano
        return user


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)