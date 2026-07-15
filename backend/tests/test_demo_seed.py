from app import insert_predefined_data
from demo_data import DEMO_POSTS
from SQL.models import Post, User
from seed_guest_policy import create_guest_user


def test_demo_seed_only_creates_data_for_demo_users_and_is_idempotent(db_session):
    guest = create_guest_user()

    insert_predefined_data()
    insert_predefined_data()

    demo_users = User.query.filter(User.email.like("user%@example.com")).all()

    assert len(demo_users) == 10
    assert all(user.is_guest is False for user in demo_users)
    assert Post.query.filter_by(user_id=guest.id).count() == 0
    assert Post.query.count() == len(DEMO_POSTS)
