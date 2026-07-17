"""GitHub OAuth helpers that keep provider tokens out of browser storage."""

from dataclasses import dataclass
import base64
import hashlib
import secrets
from urllib.parse import urlencode

import requests

from SQL.database import db
from SQL.models import User


AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
TOKEN_URL = "https://github.com/login/oauth/access_token"
USER_URL = "https://api.github.com/user"
EMAILS_URL = "https://api.github.com/user/emails"
REQUEST_TIMEOUT_SECONDS = 10


class OAuthError(Exception):
    """A safe, stable OAuth failure suitable for a login-page error code."""

    def __init__(self, code):
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class GitHubIdentity:
    github_id: int
    login: str
    name: str
    avatar_url: str | None
    email: str


def build_authorization_request(client_id, callback_url):
    state = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    query = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": callback_url,
            "scope": "user:email",
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    return f"{AUTHORIZE_URL}?{query}", state, verifier


def exchange_code(*, client_id, client_secret, callback_url, code, verifier):
    try:
        response = requests.post(
            TOKEN_URL,
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": callback_url,
                "code": code,
                "code_verifier": verifier,
            },
            headers={"Accept": "application/json"},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError) as exc:
        raise OAuthError("provider_unavailable") from exc

    token = payload.get("access_token") if isinstance(payload, dict) else None
    if not isinstance(token, str) or not token:
        raise OAuthError("token_exchange_failed")
    return token


def _github_get(url, token):
    try:
        response = requests.get(
            url,
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {token}",
                "User-Agent": "social_media-local-app",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return response.json()
    except (requests.RequestException, ValueError) as exc:
        raise OAuthError("provider_unavailable") from exc


def fetch_github_identity(token):
    profile = _github_get(USER_URL, token)
    emails = _github_get(EMAILS_URL, token)
    if not isinstance(profile, dict) or not isinstance(emails, list):
        raise OAuthError("invalid_provider_response")

    verified = [
        item
        for item in emails
        if isinstance(item, dict)
        and item.get("verified") is True
        and isinstance(item.get("email"), str)
        and item["email"]
    ]
    primary = next((item for item in verified if item.get("primary") is True), None)
    selected = primary or (verified[0] if verified else None)
    github_id = profile.get("id")
    login = profile.get("login")
    if selected is None:
        raise OAuthError("verified_email_required")
    if isinstance(github_id, bool) or not isinstance(github_id, int):
        raise OAuthError("invalid_provider_response")
    if not isinstance(login, str) or not login:
        raise OAuthError("invalid_provider_response")

    name = profile.get("name")
    return GitHubIdentity(
        github_id=github_id,
        login=login,
        name=name if isinstance(name, str) and name.strip() else login,
        avatar_url=profile.get("avatar_url")
        if isinstance(profile.get("avatar_url"), str)
        else None,
        email=selected["email"],
    )


def _available_identity_value(column, preferred, github_id, current_user=None):
    base = (preferred or str(github_id)).strip()[:50]
    candidate = base
    suffix = f"-{github_id}"
    attempt = 0
    while True:
        query = User.query.filter(column == candidate)
        if current_user is not None and current_user.id is not None:
            query = query.filter(User.id != current_user.id)
        if query.first() is None:
            return candidate
        attempt += 1
        numbered_suffix = suffix if attempt == 1 else f"{suffix}-{attempt}"
        candidate = f"{base[: 50 - len(numbered_suffix)]}{numbered_suffix}"


def upsert_github_user(identity):
    user = User.query.filter_by(github_id=identity.github_id).first()
    email_owner = User.query.filter_by(email=identity.email).first()
    if user is None:
        if (
            email_owner is not None
            and email_owner.github_id is not None
            and email_owner.github_id != identity.github_id
        ):
            raise OAuthError("identity_conflict")
        user = email_owner
    is_new = user is None
    if user is None:
        user = User(email=identity.email)
    elif email_owner is None or email_owner.id == user.id:
        user.email = identity.email

    user.github_id = identity.github_id
    user.username = _available_identity_value(
        User.username, identity.login, identity.github_id, user
    )
    user.accountname = _available_identity_value(
        User.accountname, identity.name, identity.github_id, user
    )
    user.avatarUrl = identity.avatar_url
    user.access_token = None
    user.is_guest = False
    user.guest_public_name = None
    if is_new:
        db.session.add(user)
    db.session.commit()
    return user
