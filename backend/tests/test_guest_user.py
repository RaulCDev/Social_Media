from SQL.models import User


def test_guest_users_are_distinct(db_session):
    from seed_guest_policy import create_guest_user

    first = create_guest_user()
    second = create_guest_user()

    assert first.id != second.id
    assert first.is_guest is True
    assert second.is_guest is True
    assert first.guest_public_name != second.guest_public_name
    assert first.email != second.email
    assert first.email.endswith("@anonymous.invalid")


def test_existing_users_default_to_non_guest(db_session):
    user = User(
        email="historical@example.com",
        username="historical",
        accountname="Historical User",
    )
    db_session.add(user)
    db_session.commit()

    assert user.is_guest is False
    assert user.guest_public_name is None
