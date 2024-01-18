import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsModule])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
