"""Policy for creating anonymous technical identities."""

from uuid import uuid4

from sqlalchemy.exc import IntegrityError

from SQL.database import db
from SQL.models import User


def create_guest_user():
    """Persist a guest with unique non-public technical identifiers."""
    for _ in range(3):
        identifier = uuid4().hex
        public_suffix = identifier[:12]
        user = User(
            email=f"guest-{identifier}@anonymous.invalid",
            username=f"guest_{public_suffix}",
            accountname=f"Guest {public_suffix}",
            guest_public_name=f"Guest-{public_suffix}",
            is_guest=True,
        )
        db.session.add(user)
        try:
            db.session.commit()
            return user
        except IntegrityError:
            db.session.rollback()

    raise RuntimeError("Unable to allocate a unique guest identity")
