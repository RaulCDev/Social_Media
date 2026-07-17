from SQL.database import db
from SQL.models import Like, Post
from tests.auth_helpers import authenticated_client


def _github_user(app, ip):
    client, identity, _token = authenticated_client(app, ip=ip)
    return client, identity


def test_complete_github_cookie_flow(app):
    client, identity = _github_user(app, "10.8.0.1")
    assert client.get("/auth/me").json["id"] == identity["id"]

    assert client.post("/post", json={"content": "end to end"}).status_code == 201
    post = Post.query.filter_by(user_id=identity["id"], content="end to end").one()
    cards = client.post("/cards")
    assert cards.status_code == 200
    assert any(item["id"] == post.id for item in cards.json)

    assert client.post("/comment", json={"postId": post.id, "content": "reply"}).status_code == 201
    assert client.post("/like", json={"postId": post.id}).status_code == 200
    assert Like.query.filter_by(user_id=identity["id"], post_id=post.id).count() == 1
    assert client.post("/unlike", json={"postId": post.id}).status_code == 200
    assert Like.query.filter_by(user_id=identity["id"], post_id=post.id).count() == 0

    assert client.post("/auth/logout").status_code == 204
    assert client.post("/post", json={"content": "after logout"}).status_code == 401


def test_two_github_users_cannot_spoof_or_remove_each_others_state(app):
    first_client, first = _github_user(app, "10.8.1.1")
    second_client, second = _github_user(app, "10.8.1.2")
    root = Post(user_id=first["id"], content="first owns this")
    db.session.add(root)
    db.session.commit()
    assert first_client.post("/like", json={"postId": root.id}).status_code == 200

    assert second_client.post(
        "/comment",
        json={"postId": root.id, "content": "second comment", "user_id": first["id"]},
    ).status_code == 201
    comment = Post.query.filter_by(father_id=root.id, content="second comment").one()
    assert comment.user_id == second["id"]

    assert second_client.post(
        "/unlike", json={"postId": root.id, "user_id": first["id"]}
    ).status_code == 200
    assert Like.query.filter_by(user_id=first["id"], post_id=root.id).count() == 1
