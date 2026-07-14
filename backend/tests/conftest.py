import os

import pytest


os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-only-secret-key-that-is-long-enough-for-hs256"
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["JWT_ACCESS_MINUTES"] = "60"
os.environ["FRONTEND_ORIGIN"] = "http://localhost:3000"
os.environ["COOKIE_SECURE"] = "false"

from app import app as flask_app  # noqa: E402
from SQL.database import db  # noqa: E402


@pytest.fixture()
def app():
    flask_app.config.update(TESTING=True)

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
