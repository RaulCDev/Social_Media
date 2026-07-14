export function createSessionFlow({
  restoreSession,
  createGuestSession,
  onUserChange = (_nextUser) => {},
}) {
  let user = null;
  let restoration = null;
  let guestCreation = null;

  const updateUser = (nextUser) => {
    user = nextUser;
    onUserChange(nextUser);
    return nextUser;
  };

  const restore = () => {
    if (!restoration) {
      restoration = Promise.resolve()
        .then(restoreSession)
        .then(updateUser);
    }
    return restoration;
  };

  const startGuestSession = async (force = false) => {
    if (restoration) {
      await restoration;
    }
    if (!force && user) {
      return user;
    }
    if (!guestCreation) {
      guestCreation = Promise.resolve()
        .then(createGuestSession)
        .then(updateUser)
        .finally(() => {
          guestCreation = null;
        });
    }
    return guestCreation;
  };

  return {
    restore,
    waitForRestoration: () => restoration ?? Promise.resolve(),
    startGuestSession,
    clear: () => updateUser(null),
  };
}

export async function runSessionMutation({
  hasSession,
  startGuestSession,
  request,
  isUnauthorized,
}) {
  if (!hasSession) {
    await startGuestSession(false);
  }
  try {
    return await request();
  } catch (error) {
    if (!isUnauthorized(error)) {
      throw error;
    }
    await startGuestSession(true);
    return request();
  }
}
