import { Controller, Post } from '@nestjs/common';

@Controller('trends')
export class TrendsController {
  @Post()
  async sendTrends(): Promise<Array<{ number: number; category: string; name: string; posts: string }>> {
    // Returns the static trends payload.
    return [];
  }
}
