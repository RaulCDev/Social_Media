import os

import pytest


os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-only-secret-key-that-is-long-enough-for-hs256"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["JWT_ACCESS_MINUTES"] = "60"
os.environ["FRONTEND_ORIGIN"] = "http://localhost:3000"
os.environ["COOKIE_SECURE"] = "false"
os.environ["GITHUB_CLIENT_ID"] = "test-client-id"
os.environ["GITHUB_CLIENT_SECRET"] = "test-client-secret"
os.environ["GITHUB_CALLBACK_URL"] = "http://localhost:5000/auth/github/callback"
os.environ["FRONTEND_URL"] = "http://localhost:3000"

from app import app as flask_app  # noqa: E402
from SQL.database import db  # noqa: E402


@pytest.fixture()
def app():
    flask_app.config.update(
        TESTING=True,
        POST_JTI_RATE_LIMIT=None,
        POST_IP_RATE_LIMIT=20,
        COMMENT_JTI_RATE_LIMIT=None,
        COMMENT_IP_RATE_LIMIT=60,
        LIKE_JTI_RATE_LIMIT=None,
        LIKE_IP_RATE_LIMIT=100,
        SESSION_IP_RATE_LIMIT=10,
        WRITE_RATE_WINDOW_SECONDS=60,
        SESSION_RATE_WINDOW_SECONDS=60,
    )

    with flask_app.app_context():
        db.drop_all()
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def db_session(app):
    with app.app_context():
        yield db.session
