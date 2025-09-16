export class TokenUtil {
  static extractBearerToken(authHeader?: string): string {
    // Parses the Authorization header and returns the raw Bearer token or throws on invalid format.
    if (!authHeader) throw new Error('Missing authorization header');
    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
      throw new Error('Invalid authorization header');
    }
    return token;
  }
}
