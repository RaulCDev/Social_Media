"""Application-session JWT issuance and validation helpers."""

from datetime import datetime, timedelta, timezone
from functools import wraps
from uuid import uuid4

import jwt
from flask import current_app, g, jsonify, request

from SQL.database import db
from SQL.models import RevokedToken, User


def _unauthorized():
    return jsonify({"message": "Unauthorized"}), 401


def issue_user_session(user):
    """Return a short-lived application JWT for a GitHub-linked user."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "jti": str(uuid4()),
        "auth_provider": "github",
        "iat": now,
        "exp": now
        + timedelta(minutes=current_app.config["JWT_ACCESS_MINUTES"]),
    }
    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"],
    )
    return token


def _token_from_request():
    token = request.cookies.get("access_token")
    if token:
        return token

    return None


def decode_jwt_from_request():
    """Return a validated payload, or a generic 401 Flask response tuple."""
    token = _token_from_request()
    if not token:
        return _unauthorized()

    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=[current_app.config["JWT_ALGORITHM"]],
            options={
                "require": ["sub", "jti", "auth_provider", "iat", "exp"],
            },
        )
    except jwt.PyJWTError:
        return _unauthorized()

    subject = payload.get("sub")
    jti = payload.get("jti")
    if (
        not isinstance(subject, str)
        or not subject.isdigit()
        or not isinstance(jti, str)
        or not jti
        or payload.get("auth_provider") != "github"
    ):
        return _unauthorized()

    user = db.session.get(User, int(subject))
    if user is None or user.is_guest is not False or user.github_id is None:
        return _unauthorized()
    if RevokedToken.query.filter_by(jti=jti).first() is not None:
        return _unauthorized()

    g.jwt_user = user
    return payload


def require_jwt(view):
    """Require a valid session and expose its user through ``flask.g``."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        payload = decode_jwt_from_request()
        if not isinstance(payload, dict):
            return payload

        g.current_user = g.jwt_user
        g.jwt_payload = payload
        if g.current_user.status != "active":
            return jsonify({"message": "Account is not active"}), 403
        g.current_user.last_seen_at = datetime.now(timezone.utc).replace(tzinfo=None)
        db.session.commit()
        return view(*args, **kwargs)

    return wrapped
