ALLOWED_ORIGIN = "http://localhost:3000"
UNAUTHORIZED_ORIGIN = "https://untrusted.example"


def test_allowed_origin_receives_credentialed_cors_headers(client):
    response = client.post("/trends", headers={"Origin": ALLOWED_ORIGIN})

    assert response.headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN
    assert response.headers["Access-Control-Allow-Credentials"] == "true"


def test_unauthorized_origin_receives_no_cors_headers(client):
    response = client.post("/trends", headers={"Origin": UNAUTHORIZED_ORIGIN})

    assert "Access-Control-Allow-Origin" not in response.headers
    assert "Access-Control-Allow-Credentials" not in response.headers


def test_allowed_preflight_options_is_explicit_and_credentialed(client):
    response = client.options(
        "/auth/github/start",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )

    assert response.status_code == 200
    assert response.headers["Access-Control-Allow-Origin"] == ALLOWED_ORIGIN
    assert response.headers["Access-Control-Allow-Credentials"] == "true"
    assert "GET" in response.headers["Access-Control-Allow-Methods"]


def test_unauthorized_preflight_options_receives_no_cors_headers(client):
    response = client.options(
        "/auth/github/start",
        headers={
            "Origin": UNAUTHORIZED_ORIGIN,
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert "Access-Control-Allow-Origin" not in response.headers
    assert "Access-Control-Allow-Credentials" not in response.headers
