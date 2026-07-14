"""Database-backed abuse limits keyed by pseudonymous JWT and IP hashes."""

from datetime import datetime, timezone
import hashlib
import hmac

from flask import current_app, request
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError

from SQL.database import db
from SQL.models import AbuseRateLimitBucket


def _identity_hash(identity_type, value):
    secret = current_app.config["JWT_SECRET_KEY"].encode()
    return hmac.new(secret, f"{identity_type}:{value}".encode(), hashlib.sha256).hexdigest()


def _reserve(identity_type, value, action, limit, window_seconds, now=None):
    if not value or limit <= 0 or window_seconds <= 0:
        return False
    now = now or datetime.now(timezone.utc).replace(tzinfo=None)
    epoch = int(now.timestamp())
    window_start = datetime.fromtimestamp(
        epoch - epoch % window_seconds, timezone.utc
    ).replace(tzinfo=None)
    identity_hash = _identity_hash(identity_type, value)
    bucket = AbuseRateLimitBucket(
        identity_type=identity_type,
        identity_hash=identity_hash,
        action=action,
        window_start=window_start,
        request_count=1,
    )
    db.session.add(bucket)
    try:
        db.session.commit()
        return True
    except IntegrityError:
        db.session.rollback()

    result = db.session.execute(
        update(AbuseRateLimitBucket)
        .where(
            AbuseRateLimitBucket.identity_type == identity_type,
            AbuseRateLimitBucket.identity_hash == identity_hash,
            AbuseRateLimitBucket.action == action,
            AbuseRateLimitBucket.window_start == window_start,
            AbuseRateLimitBucket.request_count < limit,
        )
        .values(request_count=AbuseRateLimitBucket.request_count + 1)
    )
    db.session.commit()
    return result.rowcount == 1


def reserve_session_ip():
    return _reserve(
        "ip", request.remote_addr or "unknown", "session",
        current_app.config["SESSION_IP_RATE_LIMIT"],
        current_app.config["SESSION_RATE_WINDOW_SECONDS"],
    )


def reserve_write(action, jti):
    prefix = action.upper()
    legacy_key = f"{prefix}_RATE_LIMIT"
    jti_limit = current_app.config.get(f"{prefix}_JTI_RATE_LIMIT")
    if jti_limit is None:
        jti_limit = current_app.config[legacy_key]
    window = current_app.config["WRITE_RATE_WINDOW_SECONDS"]
    if not _reserve("jti", jti, action, jti_limit, window):
        return False
    return _reserve(
        "ip", request.remote_addr or "unknown", action,
        current_app.config[f"{prefix}_IP_RATE_LIMIT"], window,
    )
