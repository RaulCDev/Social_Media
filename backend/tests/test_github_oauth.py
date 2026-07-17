from http.cookies import SimpleCookie
from urllib.parse import parse_qs, urlparse

from SQL.models import User


def _cookie_value(response, name):
    cookies = SimpleCookie()
    for header in response.headers.getlist("Set-Cookie"):
        cookies.load(header)
    return cookies[name].value


def test_user_accepts_unique_github_identity(db_session):
    user = User(
        email="octocat@example.com",
        username="octocat",
        accountname="The Octocat",
        github_id=583231,
    )
    db_session.add(user)
    db_session.commit()

    assert User.query.filter_by(github_id=583231).one().id == user.id


def test_github_start_rejects_missing_configuration(app):
    app.config.update(
        GITHUB_CLIENT_ID="",
        GITHUB_CLIENT_SECRET="",
        GITHUB_CALLBACK_URL="",
    )

    response = app.test_client().get("/auth/github/start")

    assert response.status_code == 503
    assert response.json == {"message": "GitHub authentication is not configured"}


def test_github_start_redirects_with_state_pkce_and_http_only_cookies(app):
    app.config.update(
        GITHUB_CLIENT_ID="client-id",
        GITHUB_CLIENT_SECRET="client-secret",
        GITHUB_CALLBACK_URL="http://localhost:5000/auth/github/callback",
    )

    response = app.test_client().get("/auth/github/start")

    assert response.status_code == 302
    parsed = urlparse(response.location)
    query = parse_qs(parsed.query)
    assert parsed.netloc == "github.com"
    assert parsed.path == "/login/oauth/authorize"
    assert query["client_id"] == ["client-id"]
    assert query["redirect_uri"] == [
        "http://localhost:5000/auth/github/callback"
    ]
    assert query["scope"] == ["user:email"]
    assert query["code_challenge_method"] == ["S256"]
    assert query["state"]
    assert query["code_challenge"]
    cookies = response.headers.getlist("Set-Cookie")
    assert any("oauth_state=" in cookie and "HttpOnly" in cookie for cookie in cookies)
    assert any(
        "oauth_code_verifier=" in cookie and "HttpOnly" in cookie
        for cookie in cookies
    )


def test_github_callback_rejects_state_mismatch_and_clears_oauth_cookies(app):
    app.config.update(
        GITHUB_CLIENT_ID="client-id",
        GITHUB_CLIENT_SECRET="client-secret",
        GITHUB_CALLBACK_URL="http://localhost:5000/auth/github/callback",
        FRONTEND_URL="http://localhost:3000",
    )
    client = app.test_client()
    start = client.get("/auth/github/start")
    state = parse_qs(urlparse(start.location).query)["state"][0]

    response = client.get(
        f"/auth/github/callback?code=test-code&state={state}-tampered"
    )

    assert response.status_code == 302
    assert response.location == "http://localhost:3000/?oauth_error=invalid_state"
    assert sum("Max-Age=0" in value for value in response.headers.getlist("Set-Cookie")) >= 2


def test_github_callback_creates_session_without_exposing_github_token(
    app, monkeypatch
):
    from github_oauth import GitHubIdentity
    import app as app_module

    app.config.update(
        GITHUB_CLIENT_ID="client-id",
        GITHUB_CLIENT_SECRET="client-secret",
        GITHUB_CALLBACK_URL="http://localhost:5000/auth/github/callback",
        FRONTEND_URL="http://localhost:3000",
    )
    monkeypatch.setattr(
        app_module,
        "exchange_code",
        lambda **_kwargs: "temporary-github-token",
    )
    monkeypatch.setattr(
        app_module,
        "fetch_github_identity",
        lambda _token: GitHubIdentity(
            github_id=583231,
            login="octocat",
            name="The Octocat",
            avatar_url="https://avatars.example/octocat.png",
            email="octocat@example.com",
        ),
    )
    client = app.test_client()
    start = client.get("/auth/github/start")
    state = parse_qs(urlparse(start.location).query)["state"][0]

    response = client.get(
        f"/auth/github/callback?code=test-code&state={state}"
    )

    assert response.status_code == 302
    assert response.location == "http://localhost:3000/home"
    assert "temporary-github-token" not in response.get_data(as_text=True)
    assert _cookie_value(response, "access_token")
    current = client.get("/auth/me")
    assert current.status_code == 200
    assert current.json["username"] == "octocat"
    assert current.json["is_guest"] is False
    user = User.query.filter_by(github_id=583231).one()
    assert user.access_token is None


def test_guest_endpoint_is_removed(client):
    assert client.post("/auth/guest").status_code == 404


def test_new_github_user_does_not_depend_on_placeholder_values(db_session):
    from github_oauth import GitHubIdentity, upsert_github_user

    db_session.add(
        User(
            email="pending@example.com",
            username="pending",
            accountname="pending",
        )
    )
    db_session.commit()

    created = upsert_github_user(
        GitHubIdentity(
            github_id=424242,
            login="new-user",
            name="New User",
            avatar_url=None,
            email="new-user@example.com",
        )
    )

    assert created.username == "new-user"
    assert created.accountname == "New User"


def test_verified_email_cannot_reassign_an_existing_github_identity(db_session):
    from github_oauth import GitHubIdentity, OAuthError, upsert_github_user

    db_session.add(
        User(
            email="linked@example.com",
            username="linked-user",
            accountname="Linked User",
            github_id=111,
        )
    )
    db_session.commit()

    try:
        upsert_github_user(
            GitHubIdentity(
                github_id=222,
                login="other-user",
                name="Other User",
                avatar_url=None,
                email="linked@example.com",
            )
        )
    except OAuthError as exc:
        assert exc.code == "identity_conflict"
    else:
        raise AssertionError("an existing GitHub identity was reassigned")

    assert User.query.filter_by(email="linked@example.com").one().github_id == 111
