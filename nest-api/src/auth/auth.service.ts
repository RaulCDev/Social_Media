import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async exchangeGithubCodeForAccessToken(code: string): Promise<string> {
    // Calls GitHub’s OAuth API to exchange the code for an access token.
    return '';
  }

  async createJwt(identityEmail: string): Promise<string> {
    // Creates a signed JWT with the user identity and expiration.
    return '';
  }

  async validateJwt(token: string): Promise<{ identity: string }> {
    // Verifies the JWT signature and expiration; returns the decoded identity payload.
    return { identity: '' };
  }

  async getCurrentUserIdFromJwt(token: string): Promise<number | null> {
    // Uses the JWT to find the user record and returns the user ID or null.
    return null;
  }

  async upsertUserFromGithubData(email: string, username: string, avatarUrl: string, appJwt: string): Promise<void> {
    // Inserts or updates the user with the app JWT as access token.
  }
}
