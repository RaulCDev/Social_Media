from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_login import LoginManager
from flask_jwt import JWT, jwt_required, current_identity

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

login_manager = LoginManager()
login_manager.init_app(app)
@cross_origin
@app.route('/login', methods=['POST'])
def login_user():
    username = request.json['username']
    password = request.json['password']
    #image_url = request.json['image_url']
    # Add below a mew parameter for add to the database

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)