from datetime import datetime, timedelta, timezone
from http.cookies import SimpleCookie

import jwt

from SQL.database import db
from SQL.models import User


def _cookie_token(response):
    cookie = SimpleCookie()
    cookie.load(response.headers["Set-Cookie"])
    return cookie["access_token"].value


def _make_token(app, user_id, **overrides):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "jti": "test-jti",
        "is_guest": True,
        "iat": now,
        "exp": now + timedelta(minutes=5),
    }
    payload.update(overrides)
    algorithm = payload.pop("_algorithm", app.config["JWT_ALGORITHM"])
    return jwt.encode(payload, app.config["JWT_SECRET_KEY"], algorithm=algorithm)


def test_guest_authentication_flow_returns_only_public_identity(client):
    created = client.post("/auth/guest")
    current = client.get("/auth/me")

    assert created.status_code == 201
    assert current.status_code == 200
    assert set(current.json) == {"id", "username", "accountname", "is_guest"}
    assert current.json["is_guest"] is True
    assert "@anonymous.invalid" not in current.get_data(as_text=True)


def test_auth_me_rejects_missing_cookie(client):
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_rejects_tampered_token(client):
    issued = client.post("/auth/guest")
    client.set_cookie("access_token", _cookie_token(issued) + "tampered")

    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_rejects_expired_token(app, db_session):
    from seed_guest_policy import create_guest_user

    user = create_guest_user()
    token = _make_token(
        app,
        user.id,
        jti="expired-jti",
        exp=datetime.now(timezone.utc) - timedelta(seconds=1),
    )
    client = app.test_client()
    client.set_cookie("access_token", token)

    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_rejects_unexpected_algorithm(app, db_session):
    from seed_guest_policy import create_guest_user

    user = create_guest_user()
    token = _make_token(app, user.id, jti="wrong-alg-jti", _algorithm="HS384")
    client = app.test_client()
    client.set_cookie("access_token", token)

    response = client.get("/auth/me")

    assert response.status_code == 401


def test_auth_me_rejects_deleted_user(client, db_session):
    issued = client.post("/auth/guest")
    user_id = issued.json["user"]["id"]
    user = db_session.get(User, user_id)
    db_session.delete(user)
    db_session.commit()

    response = client.get("/auth/me")

    assert response.status_code == 401


def test_authorization_bearer_is_supported_during_transition(app, db_session):
    from seed_guest_policy import create_guest_user

    user = create_guest_user()
    token = _make_token(app, user.id, jti="bearer-jti")

    response = app.test_client().get(
        "/auth/me", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert response.json["id"] == user.id


def test_logout_revokes_only_current_token_and_clears_cookie(client, app):
    from SQL.models import RevokedToken

    first = client.post("/auth/guest")
    first_token = _cookie_token(first)
    other_client = app.test_client()
    other_client.post("/auth/guest")

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


def test_guest_token_is_not_returned_or_logged(client, caplog, capsys):
    response = client.post("/auth/guest")
    token = _cookie_token(response)
    captured = capsys.readouterr()

    assert token not in response.get_data(as_text=True)
    assert token not in captured.out
    assert token not in captured.err
    assert all(token not in record.getMessage() for record in caplog.records)
