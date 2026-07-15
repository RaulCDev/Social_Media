from demo_data import DEMO_USERS


def test_demo_users_are_defined_in_the_demo_data_module():
    assert len(DEMO_USERS) == 10
    assert DEMO_USERS[0] == {
        'email': 'user1@example.com',
        'username': 'user1',
        'accountname': 'user1',
        'avatar_url': 'https://github.com/user1.png',
    }
    assert DEMO_USERS[-1]['email'] == 'user10@example.com'
