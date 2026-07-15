from demo_data import DEMO_POSTS, DEMO_USERS


def test_demo_users_are_defined_in_the_demo_data_module():
    assert len(DEMO_USERS) == 10
    assert DEMO_USERS[0] == {
        'email': 'user1@example.com',
        'username': 'user1',
        'accountname': 'user1',
        'avatar_url': 'https://github.com/user1.png',
    }
    assert DEMO_USERS[-1]['email'] == 'user10@example.com'


def test_at_least_thirty_demo_posts_are_defined_for_known_users():
    demo_emails = {user['email'] for user in DEMO_USERS}

    assert len(DEMO_POSTS) >= 30
    assert all(post['user_email'] in demo_emails for post in DEMO_POSTS)
    assert all(post['content'].strip() for post in DEMO_POSTS)
    assert len({(post['user_email'], post['content']) for post in DEMO_POSTS}) == len(DEMO_POSTS)
