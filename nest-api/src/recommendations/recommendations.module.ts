import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';

@Module({
  controllers: [RecommendationsController],
})
export class RecommendationsModule {}
