from SQL.database import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    accountname = db.Column(db.String(50), unique=True, nullable=False)
    avatarUrl = db.Column(db.String(200), nullable=True)
    access_token = db.Column(db.String(255), unique=True, nullable=True)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('user', lazy=True))
    likes_amount = db.Column(db.Integer, default=0)
    views_amount = db.Column(db.Integer, default=0)
    reposts_amount = db.Column(db.Integer, default=0)
    comments_amount = db.Column(db.Integer, default=0)

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('liked_by', lazy=True))
    post = db.relationship('Post', backref=db.backref('liked', lazy=True))
