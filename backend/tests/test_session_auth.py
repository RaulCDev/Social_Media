from datetime import datetime, timedelta, timezone
from http.cookies import SimpleCookie

import jwt

from auth import issue_user_session
from SQL.models import RevokedToken, User
from tests.auth_helpers import authenticated_client, create_github_user


def _make_token(app, user_id, **overrides):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "jti": "test-jti",
        "auth_provider": "github",
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    payload.update(overrides)
    algorithm = payload.pop("_algorithm", app.config["JWT_ALGORITHM"])
    return jwt.encode(payload, app.config["JWT_SECRET_KEY"], algorithm=algorithm)


def test_github_session_returns_only_public_identity(app):
    client, identity, _token = authenticated_client(app)

    current = client.get("/auth/me")

    assert current.status_code == 200
    assert set(current.json) == {"id", "username", "accountname", "is_guest"}
    assert current.json == identity
    assert current.json["is_guest"] is False


def test_auth_me_rejects_missing_cookie(client):
    assert client.get("/auth/me").status_code == 401


def test_auth_me_rejects_tampered_token(app):
    client, _identity, token = authenticated_client(app)
    client.set_cookie("access_token", token + "tampered")

    assert client.get("/auth/me").status_code == 401


def test_auth_me_rejects_expired_token(app):
    user = create_github_user()
    token = _make_token(
        app,
        user.id,
        jti="expired-jti",
        exp=datetime.now(timezone.utc) - timedelta(seconds=1),
    )
    client = app.test_client()
    client.set_cookie("access_token", token)

    assert client.get("/auth/me").status_code == 401


def test_auth_me_rejects_unexpected_algorithm(app):
    user = create_github_user()
    token = _make_token(app, user.id, jti="wrong-alg-jti", _algorithm="HS384")
    client = app.test_client()
    client.set_cookie("access_token", token)

    assert client.get("/auth/me").status_code == 401


def test_auth_me_rejects_deleted_user(app, db_session):
    client, identity, _token = authenticated_client(app)
    user = db_session.get(User, identity["id"])
    db_session.delete(user)
    db_session.commit()

    assert client.get("/auth/me").status_code == 401


def test_auth_me_rejects_guest_user_with_github_claim(app, db_session):
    user = User(
        email="guest@example.com",
        username="guest",
        accountname="Guest",
        github_id=99999,
        is_guest=True,
    )
    db_session.add(user)
    db_session.commit()
    client = app.test_client()
    client.set_cookie("access_token", _make_token(app, user.id, jti="guest-jti"))

    assert client.get("/auth/me").status_code == 401


def test_auth_me_rejects_bearer_token(app):
    user = create_github_user()
    token = issue_user_session(user)

    response = app.test_client().get(
        "/auth/me", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 401


def test_logout_revokes_only_current_token_and_clears_cookie(app):
    client, _identity, first_token = authenticated_client(app)
    other_client, _other_identity, _other_token = authenticated_client(app)

    logout = client.post("/auth/logout")

    assert logout.status_code == 204
    assert "Max-Age=0" in logout.headers["Set-Cookie"]
    assert client.get("/auth/me").status_code == 401
    assert other_client.get("/auth/me").status_code == 200
    payload = jwt.decode(
        first_token,
        app.config["JWT_SECRET_KEY"],
        algorithms=[app.config["JWT_ALGORITHM"]],
    )
    assert RevokedToken.query.filter_by(jti=payload["jti"]).one_or_none() is not None


def test_application_token_is_not_logged(app, caplog, capsys):
    user = create_github_user()
    token = issue_user_session(user)
    captured = capsys.readouterr()

    assert token not in captured.out
    assert token not in captured.err
    assert all(token not in record.getMessage() for record in caplog.records)
