import { Injectable } from '@nestjs/common';

@Injectable()
export class LikesService {
  async addLike(postId: number, userId: number): Promise<void> {
    // Inserts a like for a post by a user.
  }

  async removeLike(postId: number, userId: number): Promise<boolean> {
    // Removes a like and returns whether a like was found and deleted.
    return false;
  }

  async countLikes(postId: number): Promise<number> {
    // Returns number of likes for a post.
    return 0;
  }

  async isLikedByUser(postId: number, userId: number): Promise<boolean> {
    // Returns whether the given user liked the post.
    return false;
  }
}
