import { Injectable } from '@nestjs/common';
import { CardDto, PostWithCommentsDto, PostBasicDto } from '../dtos/post.dto';

@Injectable()
export class PostsService {
  async createPost(userId: number, content: string): Promise<void> {
    // Inserts a new post for the given user.
  }

  async addComment(userId: number, postId: number, content: string): Promise<void> {
    // Inserts a new comment associated to the post and user.
  }

  async getFeedCardsForUser(userId: number): Promise<Array<CardDto>> {
    // Queries latest root posts, computes likes/views/comments and whether user liked each.
    return [];
  }

  async getPostWithComments(postId: number): Promise<PostWithCommentsDto> {
    // Retrieves a post and all its comments with counts and flags.
    return {} as PostWithCommentsDto;
  }

  async getPostBasic(postId: number): Promise<PostBasicDto> {
    // Retrieves minimal post data.
    return {} as PostBasicDto;
  }

  async incrementViews(postId: number): Promise<void> {
    // Increments the views counter on a post.
  }
}
