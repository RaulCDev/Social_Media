def test_guest_session_sets_http_only_cookie(client):
    response = client.post(
        "/auth/guest",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 201
    assert response.json["user"]["is_guest"] is True
    assert "access_token" not in response.json

    cookie = response.headers["Set-Cookie"]
    assert "HttpOnly" in cookie
    assert "SameSite=Lax" in cookie
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
    assert response.headers["Access-Control-Allow-Credentials"] == "true"


def test_guest_session_cookie_is_secure_when_configured(app):
    original = app.config.get("COOKIE_SECURE")
    app.config["COOKIE_SECURE"] = True
    try:
        response = app.test_client().post("/auth/guest")
    finally:
        app.config["COOKIE_SECURE"] = original

    assert response.status_code == 201
    assert "Secure" in response.headers["Set-Cookie"]
