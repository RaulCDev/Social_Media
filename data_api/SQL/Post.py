from datetime import datetime
from SQL.database import db
from SQL.User import User

class Post(db.Model):
    user = db.relationship('User', backref=db.backref('messages', lazy=True))

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
