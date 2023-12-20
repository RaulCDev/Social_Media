from flask import Flask

app = Flask(__name__)

# User example
new_user = ('John Doe', 'https://i.imgur.com/YcP0tik.jpeg')

@app.route('/api/hello', methods=['GET'])
def hello():
    return {'mesage': 'Hello, world!'}

if __name__ == '__main__':
    app.run(debug=True)