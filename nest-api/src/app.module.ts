import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { TrendsModule } from './trends/trends.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [AuthModule, UsersModule, PostsModule, LikesModule, TrendsModule, RecommendationsModule, SeedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
