import { Controller, Post } from '@nestjs/common';

@Controller('recommendations')
export class RecommendationsController {
  @Post('users')
  async sendUsersRecommendation(): Promise<Array<{ name: string; username: string; src: string }>> {
    // Returns the static users recommendation payload.
    return [];
  }
}
