from datetime import datetime, timedelta

import pytest

from SQL.database import db
from SQL.models import Like, Post


WRITE_ENDPOINTS = (
    ("/post", {"content": "hello"}),
    ("/comment", {"postId": 1, "content": "hello"}),
    ("/like", {"postId": 1}),
    ("/unlike", {"postId": 1}),
)


def _authenticated_client(app):
    client = app.test_client()
    issued = client.post("/auth/guest")
    assert issued.status_code == 201
    return client, issued.json["user"]


def _post(user_id, content="existing post", father_id=None):
    post = Post(user_id=user_id, content=content, father_id=father_id)
    db.session.add(post)
    db.session.commit()
    return post


@pytest.mark.parametrize(("path", "payload"), WRITE_ENDPOINTS)
def test_write_endpoints_require_jwt(client, path, payload):
    response = client.post(path, json=payload)

    assert response.status_code == 401
    assert response.json == {"message": "Unauthorized"}


def test_post_identity_comes_only_from_current_user(app):
    client, current_user = _authenticated_client(app)
    _, other_user = _authenticated_client(app)

    response = client.post(
        "/post",
        json={
            "content": "owned by the session",
            "user_id": other_user["id"],
            "email": "spoofed@example.com",
            "access_token": "spoofed-token",
        },
    )

    assert response.status_code == 201
    created = Post.query.filter_by(content="owned by the session").one()
    assert created.user_id == current_user["id"]


def test_comment_and_like_identity_come_only_from_current_user(app):
    owner_client, owner = _authenticated_client(app)
    actor_client, actor = _authenticated_client(app)
    post = _post(owner["id"])
    spoofed_identity = {
        "user_id": owner["id"],
        "email": "spoofed@example.com",
        "access_token": "spoofed-token",
    }

    comment = actor_client.post(
        "/comment",
        json={"postId": post.id, "content": "actor comment", **spoofed_identity},
    )
    liked = actor_client.post("/like", json={"postId": post.id, **spoofed_identity})

    assert owner_client.get("/auth/me").status_code == 200
    assert comment.status_code == 201
    assert liked.status_code == 200
    assert Post.query.filter_by(father_id=post.id).one().user_id == actor["id"]
    assert Like.query.filter_by(post_id=post.id).one().user_id == actor["id"]


@pytest.mark.parametrize("path", ("/post", "/comment", "/like", "/unlike"))
@pytest.mark.parametrize("payload", (None, [], "not-an-object", 7))
def test_write_endpoints_reject_missing_or_non_object_json(app, path, payload):
    client, _ = _authenticated_client(app)
    kwargs = {} if payload is None else {"json": payload}

    response = client.post(path, **kwargs)

    assert response.status_code == 400
    assert response.json == {"message": "Invalid JSON"}


@pytest.mark.parametrize(
    "content",
    (None, "", "   ", 123, [], {}, "x" * 281),
)
@pytest.mark.parametrize(
    ("path", "extra"),
    (("/post", {}), ("/comment", {"postId": 1})),
)
def test_post_and_comment_require_non_empty_string_within_280_chars(
    app, path, extra, content
):
    client, current_user = _authenticated_client(app)
    if path == "/comment":
        extra = {"postId": _post(current_user["id"]).id}

    response = client.post(path, json={"content": content, **extra})

    assert response.status_code == 400
    assert response.json == {"message": "Content must be a non-empty string of at most 280 characters"}


@pytest.mark.parametrize("path", ("/comment", "/like", "/unlike"))
def test_post_linked_mutations_require_an_existing_post(app, path):
    client, _ = _authenticated_client(app)
    payload = {"postId": 999999}
    if path == "/comment":
        payload["content"] = "valid comment"

    response = client.post(path, json=payload)

    assert response.status_code == 404
    assert response.json == {"message": "Post not found"}


@pytest.mark.parametrize("path", ("/comment", "/like", "/unlike"))
@pytest.mark.parametrize("post_id", (None, "1", 0, -1, True, [], {}))
def test_post_linked_mutations_require_a_positive_integer_post_id(app, path, post_id):
    client, _ = _authenticated_client(app)
    payload = {"postId": post_id}
    if path == "/comment":
        payload["content"] = "valid comment"

    response = client.post(path, json=payload)

    assert response.status_code == 400
    assert response.json == {"message": "Post ID must be a positive integer"}


def test_post_and_comment_accept_exactly_280_characters(app):
    client, current_user = _authenticated_client(app)
    root = _post(current_user["id"])
    content = "x" * 280

    created_post = client.post("/post", json={"content": content})
    created_comment = client.post(
        "/comment", json={"postId": root.id, "content": content}
    )

    assert created_post.status_code == 201
    assert created_comment.status_code == 201


def test_two_users_keep_posts_comments_and_likes_separate(app):
    first_client, first = _authenticated_client(app)
    second_client, second = _authenticated_client(app)
    root = _post(first["id"])

    assert first_client.post("/post", json={"content": "first post"}).status_code == 201
    assert second_client.post("/post", json={"content": "second post"}).status_code == 201
    assert first_client.post(
        "/comment", json={"postId": root.id, "content": "first comment"}
    ).status_code == 201
    assert second_client.post(
        "/comment", json={"postId": root.id, "content": "second comment"}
    ).status_code == 201
    assert first_client.post("/like", json={"postId": root.id}).status_code == 200
    assert second_client.post("/like", json={"postId": root.id}).status_code == 200

    assert {post.user_id for post in Post.query.filter(Post.father_id.is_(None)).all()} == {
        first["id"],
        second["id"],
    }
    assert {comment.user_id for comment in Post.query.filter_by(father_id=root.id).all()} == {
        first["id"],
        second["id"],
    }
    assert {like.user_id for like in Like.query.filter_by(post_id=root.id).all()} == {
        first["id"],
        second["id"],
    }


def test_duplicate_like_is_stable_and_unique(app):
    client, current_user = _authenticated_client(app)
    post = _post(current_user["id"])

    first = client.post("/like", json={"postId": post.id})
    duplicate = client.post("/like", json={"postId": post.id})

    assert first.status_code == duplicate.status_code == 200
    assert first.json == duplicate.json == {"message": "Like saved successfully"}
    assert Like.query.filter_by(user_id=current_user["id"], post_id=post.id).count() == 1
    unique_columns = {
        tuple(column.name for column in constraint.columns)
        for constraint in Like.__table__.constraints
        if constraint.__class__.__name__ == "UniqueConstraint"
    }
    assert ("user_id", "post_id") in unique_columns


def test_unlike_is_idempotent_and_cannot_remove_another_users_like(app):
    owner_client, owner = _authenticated_client(app)
    other_client, other = _authenticated_client(app)
    post = _post(owner["id"])
    assert owner_client.post("/like", json={"postId": post.id}).status_code == 200

    other_attempt = other_client.post(
        "/unlike",
        json={
            "postId": post.id,
            "user_id": owner["id"],
            "email": "spoofed@example.com",
            "access_token": "spoofed-token",
        },
    )
    assert Like.query.filter_by(user_id=owner["id"], post_id=post.id).count() == 1

    first = owner_client.post("/unlike", json={"postId": post.id})
    repeated = owner_client.post("/unlike", json={"postId": post.id})

    assert other_attempt.status_code == 200
    assert Like.query.filter_by(user_id=other["id"], post_id=post.id).count() == 0
    assert first.status_code == repeated.status_code == 200
    assert first.json == repeated.json == {"message": "Like removed successfully"}
    assert Like.query.filter_by(post_id=post.id).count() == 0


def test_public_read_endpoints_do_not_require_jwt(client, db_session):
    from seed_guest_policy import create_guest_user

    user = create_guest_user()
    post = _post(user.id)
    requests = (
        ("/cards", None),
        ("/postCards", {"post_id": post.id}),
        ("/postData", post.id),
        ("/trends", None),
        ("/users_recomendation", None),
        ("/profileData", {"user_name": user.username}),
    )

    for path, payload in requests:
        kwargs = {} if payload is None else {"json": payload}
        response = client.post(path, **kwargs)
        assert response.status_code == 200, (path, response.get_data(as_text=True))


def test_post_and_comment_rate_limits_are_per_identity_and_configurable(app):
    original = {
        "POST_RATE_LIMIT": app.config["POST_RATE_LIMIT"],
        "POST_RATE_WINDOW_SECONDS": app.config["POST_RATE_WINDOW_SECONDS"],
        "COMMENT_RATE_LIMIT": app.config["COMMENT_RATE_LIMIT"],
        "COMMENT_RATE_WINDOW_SECONDS": app.config["COMMENT_RATE_WINDOW_SECONDS"],
    }
    app.config.update(
        POST_RATE_LIMIT=1,
        POST_RATE_WINDOW_SECONDS=60,
        COMMENT_RATE_LIMIT=1,
        COMMENT_RATE_WINDOW_SECONDS=60,
    )
    try:
        first_client, first = _authenticated_client(app)
        second_client, second = _authenticated_client(app)
        _, root_owner = _authenticated_client(app)
        root = _post(root_owner["id"])

        assert first_client.post("/post", json={"content": "first allowed"}).status_code == 201
        assert first_client.post("/post", json={"content": "first blocked"}).status_code == 429
        assert second_client.post("/post", json={"content": "second allowed"}).status_code == 201
        first_post = Post.query.filter_by(user_id=first["id"], content="first allowed").one()
        first_post.timestamp = datetime.utcnow() - timedelta(seconds=61)
        db.session.commit()
        assert first_client.post("/post", json={"content": "allowed after window"}).status_code == 201
        assert first_client.post(
            "/comment", json={"postId": root.id, "content": "comment allowed"}
        ).status_code == 201
        assert first_client.post(
            "/comment", json={"postId": root.id, "content": "comment blocked"}
        ).status_code == 429
        assert second_client.post(
            "/comment", json={"postId": root.id, "content": "other allowed"}
        ).status_code == 201
        first_comment = Post.query.filter_by(
            user_id=first["id"], content="comment allowed", father_id=root.id
        ).one()
        first_comment.timestamp = datetime.utcnow() - timedelta(seconds=61)
        db.session.commit()
        assert first_client.post(
            "/comment", json={"postId": root.id, "content": "comment after window"}
        ).status_code == 201
    finally:
        app.config.update(original)
