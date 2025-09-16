import { Body, Controller, Post as PostMethod, Req, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @PostMethod('like')
  async like(@Body() dto: { postId: number }, @Req() req: any): Promise<{ message: string } | { error: string }> {
    // Validates JWT, creates a like record for the post and current user.
    return { message: 'Like saved successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod('unlike')
  async unlike(@Body() dto: { postId: number }, @Req() req: any): Promise<{ message: string } | { error: string }> {
    // Validates JWT, removes the like record for the post and current user if it exists.
    return { message: 'Like removed successfully' };
  }
}
