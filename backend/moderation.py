"""Authorization helpers for the deliberately small moderation surface."""

from functools import wraps

from flask import g, jsonify


def require_moderator(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if g.current_user.role not in {"moderator", "admin"}:
            return jsonify({"message": "Moderator access required"}), 403
        return view(*args, **kwargs)

    return wrapped
