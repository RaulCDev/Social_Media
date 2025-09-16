import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenUtil } from '../common/token.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extracts and validates the Bearer token, attaches user identity to the request, and allows/denies access.
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'] || req.headers['Authorization'];
    const token = TokenUtil.extractBearerToken(typeof header === 'string' ? header : undefined);
    try {
      const payload = await this.authService.validateJwt(token);
      req.user = { identity: payload.identity };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or missing token');
    }
  }
}
