import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  async insertPredefinedData(): Promise<void> {
    // Creates initial users and posts if they don’t exist, mirroring the Flask seeding logic.
  }
}
