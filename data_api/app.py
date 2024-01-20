from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import jwt
from datetime import datetime, timedelta, timezone

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

def create_token(identity):
    expires_delta = timedelta(minutes=15)  # Establece la duración de expiración del token
    expires = datetime.now(timezone.utc) + expires_delta

    payload = {
        "identity": identity,
        "exp": expires,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token

# Define una función para obtener el usuario según su nombre de usuario
def authenticate(username, password):
    user = User.query.filter_by(username=username).first()
    if user and user.password == password:  # Comparación de contraseñas en texto plano
        return user

@cross_origin
@app.route('/login', methods=['POST'])
def login_user():
    username = request.json['username']
    password = request.json['password']

    # Autentica al usuario
    user = authenticate(username, password)

    if user:
        # Genera el JWT para el usuario autenticado
        return jsonify({'succes': True,'access_token': create_token(user.username)})

    return jsonify({'message': 'Error de autenticación', 'success': False}), 40

@cross_origin
@app.route('/register', methods=['POST'])
def register_user():
    username = request.json['username']
    password = request.json['password']
    #image_url = request.json['image_url']
    # Add below a mew parameter for add to the database

    # Search if the user already exists
    existing_user = User.query.filter_by(username=username).first()

    if existing_user:
        # The user already exists
        return jsonify({"message": "El usuario ya existe", "success": False})
    else:
        # Create a new instance of the User model
        new_user = User(username=username, password=password)

        # Save the new user in the database
        db.session.add(new_user)
        db.session.commit()

        # Return a response with a success message
        return jsonify({"message": "Usuario registrado exitosamente", "success": True})

@cross_origin
@app.route('/prueba', methods=['POST'])
def name():

    return jsonify({"message": "Entro papi", "success": True})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)