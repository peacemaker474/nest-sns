import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entity/image.entity';
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsImagesService } from './image/images.service';
import { PostsModel } from './entity/posts.entity';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImageModel]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  exports: [PostsService],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}
