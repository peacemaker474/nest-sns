import { CommentsController } from './comments.controller';
import { CommentsModel } from './entity/comments.entity';
import { CommentsService } from './comments.service';
import { CommonModule } from 'src/common/common.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CommentsModel]), CommonModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
