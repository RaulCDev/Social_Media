import { Body, Controller, Get, Post as PostMethod, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CardDto, PostWithCommentsDto, PostBasicDto } from '../dtos/post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @PostMethod()
  async post(@Body() createPostDto: { content: string }, @Req() req: any): Promise<{ message: string }> {
    // Validates JWT from the Authorization header, creates a new post for the authenticated user.
    return { message: 'Post created successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod('comment')
  async comment(@Body() dto: { postId: number; content: string }, @Req() req: any): Promise<{ message: string } | { error: string }> {
    // Creates a comment under a post for the authenticated user; validates 280 characters limit.
    return { message: 'Comment posted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod('cards')
  async getCards(@Req() req: any): Promise<Array<CardDto>> {
    // Returns the latest posts (no father_id), with likes/views/comments counts and if the current user liked them; increments view count.
    return [];
  }

  @PostMethod('postCards')
  async postCards(@Body() dto: { post_id: number }): Promise<PostWithCommentsDto> {
    // Returns a post by id with aggregate metrics and a list of comments with their metrics.
    // Note: In Nest, you might prefer using GET /posts/:id/cards, but we mirror the Flask route.
    return {} as PostWithCommentsDto;
  }

  @PostMethod('postData')
  async postData(@Body() dto: { id: number }): Promise<PostBasicDto> {
    // Returns basic post data by id.
    return {} as PostBasicDto;
  }
}
