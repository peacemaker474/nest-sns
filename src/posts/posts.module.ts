import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsModel } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
