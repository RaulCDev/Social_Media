from flask import Flask
from flask_sqlalchemy import SQLAlchemy

#Import SQL database models from models.py
from models import User

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://user:1234@localhost:3306/socialmedia'
db = SQLAlchemy(app)



@app.route('/register', methods=['POST'])
def register_user():

    username = request.json['username']
    password = request.json['password']

    # Crear una nueva instancia del modelo de usuario
    new_user = User(username=username, password=password, image_url=image_url)

    # Guardar el nuevo usuario en la base de datos
    db.session.add(new_user)
    db.session.commit()

    # Devolver una respuesta adecuada, por ejemplo un mensaje de éxito
    return jsonify({'message': 'Usuario registrado exitosamente'})

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)