def test_github_start_sets_http_only_oauth_cookies(client):
    response = client.get(
        "/auth/github/start",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 302
    cookies = response.headers.getlist("Set-Cookie")
    assert len(cookies) == 2
    assert all("HttpOnly" in cookie for cookie in cookies)
    assert all("SameSite=Lax" in cookie for cookie in cookies)
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"
    assert response.headers["Access-Control-Allow-Credentials"] == "true"


def test_github_start_cookies_are_secure_when_configured(app):
    original = app.config.get("COOKIE_SECURE")
    app.config["COOKIE_SECURE"] = True
    try:
        response = app.test_client().get("/auth/github/start")
    finally:
        app.config["COOKIE_SECURE"] = original

    assert response.status_code == 302
    assert all(
        "Secure" in cookie for cookie in response.headers.getlist("Set-Cookie")
    )
