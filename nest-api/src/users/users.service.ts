import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  async findByEmail(email: string): Promise<User | null> {
    // Retrieves a user by email.
    return null;
  }

  async findByUsername(username: string): Promise<User | null> {
    // Retrieves a user by username.
    return null;
  }

  async getProfileData(username: string): Promise<{ post_count: number }> {
    // Counts posts for the given user.
    return { post_count: 0 };
  }

  async getUserPublicDataByAccessToken(appJwt: string): Promise<{ email: string; username: string; accountname: string; avatarUrl: string } | null> {
    // Loads the user using the app JWT and returns public fields.
    return null;
  }
}
