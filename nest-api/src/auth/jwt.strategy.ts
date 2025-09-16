import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy {
  async validate(payload: { identity: string }): Promise<any> {
    // Returns the user object or identity used by the guard after JWT validation.
    return { identity: payload.identity };
  }
}
