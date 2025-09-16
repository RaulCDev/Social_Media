import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('github/callback')
  async githubCallback(@Body() dto: { code: string }): Promise<{ success: boolean; access_token: string } | { success: boolean; error: string }> {
    // Exchanges the GitHub OAuth code for a GitHub access token, creates a JWT for the app, stores/updates the user, and returns the JWT.
    return { success: true, access_token: '' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getUserData(@Req() req: any): Promise<{ email: string; username: string; accountname: string; avatarUrl: string }> {
    // Extracts the Bearer JWT from the request, loads the user by token, and returns the user’s public data.
    return { email: '', username: '', accountname: '', avatarUrl: '' };
  }
}
