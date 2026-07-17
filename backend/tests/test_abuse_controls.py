from datetime import datetime, timedelta, timezone

import pytest

from SQL.database import db
from SQL.models import ContentReport, Post, User
from tests.auth_helpers import authenticated_client


def _github_user(app, *, ip="127.0.0.1"):
    client, identity, _token = authenticated_client(app, ip=ip)
    return client, identity


def _post(user_id, content="root"):
    post = Post(user_id=user_id, content=content)
    db.session.add(post)
    db.session.commit()
    return post


def test_github_oauth_start_rate_limit_is_per_ip_and_configurable(app):
    app.config.update(SESSION_IP_RATE_LIMIT=1, SESSION_RATE_WINDOW_SECONDS=60)

    first = app.test_client().get("/auth/github/start", environ_base={"REMOTE_ADDR": "10.0.0.1"})
    blocked = app.test_client().get("/auth/github/start", environ_base={"REMOTE_ADDR": "10.0.0.1"})
    other_ip = app.test_client().get("/auth/github/start", environ_base={"REMOTE_ADDR": "10.0.0.2"})

    assert first.status_code == 302
    assert blocked.status_code == 429
    assert other_ip.status_code == 302


@pytest.mark.parametrize(
    ("path", "payload", "jti_key", "ip_key"),
    (
        ("/post", {"content": "one"}, "POST_JTI_RATE_LIMIT", "POST_IP_RATE_LIMIT"),
        ("/comment", {"content": "one"}, "COMMENT_JTI_RATE_LIMIT", "COMMENT_IP_RATE_LIMIT"),
        ("/like", {}, "LIKE_JTI_RATE_LIMIT", "LIKE_IP_RATE_LIMIT"),
    ),
)
def test_write_limits_use_jti_and_ip_without_merging_github_identities(
    app, path, payload, jti_key, ip_key
):
    app.config.update({jti_key: 1, ip_key: 10, "WRITE_RATE_WINDOW_SECONDS": 60})
    first_client, first = _github_user(app, ip="10.1.0.1")
    second_client, second = _github_user(app, ip="10.1.0.1")
    root = _post(first["id"])

    first_payload = dict(payload)
    second_payload = dict(payload)
    if path in ("/comment", "/like"):
        first_payload["postId"] = root.id
        second_payload["postId"] = root.id
    if path == "/comment":
        second_payload["content"] = "two"

    assert first_client.post(path, json=first_payload, environ_base={"REMOTE_ADDR": "10.1.0.1"}).status_code in (200, 201)
    assert first_client.post(path, json=first_payload, environ_base={"REMOTE_ADDR": "10.1.0.1"}).status_code == 429
    assert second_client.post(path, json=second_payload, environ_base={"REMOTE_ADDR": "10.1.0.1"}).status_code in (200, 201)
    assert first_client.post("/cards", environ_base={"REMOTE_ADDR": "10.1.0.1"}).status_code == 200


@pytest.mark.parametrize("status", ("suspended", "blocked"))
def test_non_active_users_receive_403_for_authenticated_writes(app, status):
    client, identity = _github_user(app)
    user = db.session.get(User, identity["id"])
    user.status = status
    db.session.commit()

    response = client.post("/post", json={"content": "denied"})

    assert response.status_code == 403
    assert response.json == {"message": "Account is not active"}


def test_authenticated_users_can_report_and_only_moderators_can_hide(app):
    reporter, reporter_identity = _github_user(app)
    moderator, moderator_identity = _github_user(app)
    post = _post(reporter_identity["id"], "reported")

    report = reporter.post("/reports", json={"postId": post.id, "reason": "spam"})
    forbidden = reporter.post(f"/moderation/posts/{post.id}/hide")

    moderator_user = db.session.get(User, moderator_identity["id"])
    moderator_user.role = "moderator"
    db.session.commit()
    hidden = moderator.post(f"/moderation/posts/{post.id}/hide")
    queue = moderator.get("/moderation/reports")

    assert report.status_code == 201
    assert ContentReport.query.filter_by(reporter_id=reporter_identity["id"], post_id=post.id).count() == 1
    assert forbidden.status_code == 403
    assert hidden.status_code == 200
    assert queue.status_code == 200
    assert queue.json[0]["postId"] == post.id
    assert reporter.post("/postData", json=post.id).status_code == 404
    assert reporter.post("/comment", json={"postId": post.id, "content": "no"}).status_code == 404
    assert reporter.post("/like", json={"postId": post.id}).status_code == 404


def test_only_moderators_can_change_user_status(app):
    actor, actor_identity = _github_user(app)
    moderator, moderator_identity = _github_user(app)
    target_client, target_identity = _github_user(app)

    denied = actor.post(
        f"/moderation/users/{target_identity['id']}/status",
        json={"status": "suspended"},
    )
    moderator_user = db.session.get(User, moderator_identity["id"])
    moderator_user.role = "admin"
    db.session.commit()
    changed = moderator.post(
        f"/moderation/users/{target_identity['id']}/status",
        json={"status": "suspended"},
    )

    assert actor_identity["id"] != moderator_identity["id"]
    assert denied.status_code == 403
    assert changed.status_code == 200
    assert target_client.post("/post", json={"content": "denied"}).status_code == 403


def test_authenticated_request_updates_last_seen(app):
    client, identity = _github_user(app)
    user = db.session.get(User, identity["id"])
    old = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=2)
    user.last_seen_at = old
    db.session.commit()

    assert client.get("/auth/me").status_code == 200
    db.session.refresh(user)
    assert user.last_seen_at > old
