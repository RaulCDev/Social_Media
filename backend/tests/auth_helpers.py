from itertools import count

from auth import issue_user_session
from SQL.database import db
from SQL.models import User


_identity_sequence = count(1000)


def create_github_user(*, role="member", status="active"):
    github_id = next(_identity_sequence)
    user = User(
        email=f"github-{github_id}@example.com",
        username=f"github-{github_id}",
        accountname=f"GitHub User {github_id}",
        github_id=github_id,
        is_guest=False,
        role=role,
        status=status,
    )
    db.session.add(user)
    db.session.commit()
    return user


def authenticated_client(app, *, ip="127.0.0.1", role="member", status="active"):
    client = app.test_client()
    client.environ_base["REMOTE_ADDR"] = ip
    user = create_github_user(role=role, status=status)
    token = issue_user_session(user)
    client.set_cookie("access_token", token)
    identity = {
        "id": user.id,
        "username": user.username,
        "accountname": user.accountname,
        "is_guest": False,
    }
    return client, identity, token
