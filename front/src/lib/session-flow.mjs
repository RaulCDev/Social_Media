export async function runAuthenticatedMutation({ hasSession, request }) {
  if (!hasSession) {
    throw new Error("Authentication required");
  }
  return request();
}
