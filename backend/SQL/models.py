from SQL.database import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    accountname = db.Column(db.String(50), unique=True, nullable=False)
    avatarUrl = db.Column(db.String(200), nullable=True)
    access_token = db.Column(db.String(255), unique=True, nullable=True)
    is_guest = db.Column(db.Boolean, nullable=False, default=False, server_default="0")
    guest_public_name = db.Column(db.String(50), unique=True, nullable=True)


class RevokedToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), unique=True, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class RateLimitBucket(db.Model):
    __table_args__ = (
        db.UniqueConstraint(
            'user_id',
            'action',
            'window_start',
            name='uq_rate_limit_identity_action_window',
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(16), nullable=False)
    window_start = db.Column(db.DateTime, nullable=False)
    request_count = db.Column(db.Integer, nullable=False, default=1)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    views_amount = db.Column(db.Integer, default=0)
    user = db.relationship('User', backref=db.backref('posts', lazy=True))
    father_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    father_post = db.relationship('Post', backref=db.backref('responses', lazy=True), remote_side=[id])

    def count_likes(self):
        return Like.query.filter_by(post_id=self.id).count()

    def count_comments(self):
        return Post.query.filter_by(father_id=self.id).count()

    def is_liked_by_user(self, user_id):
        return Like.query.filter_by(post_id=self.id, user_id=user_id).count() > 0


class Like(db.Model):
    __table_args__ = (
        db.UniqueConstraint('user_id', 'post_id', name='uq_like_user_post'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('likes', lazy=True))

