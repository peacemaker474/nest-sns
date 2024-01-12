import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './image/images.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(@User('id') userId: number, @Body() postData: CreatePostDto) {
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    try {
      const post = await this.postsService.createPost(userId, postData, qr);

      for (let i = 0; i < postData.images.length; i++) {
        await this.postsImagesService.createPostImage({
          post,
          order: i + 1,
          path: postData.images[i],
          type: ImageModelType.POST_IMAGE,
        });
      }

      await qr.commitTransaction();
      await qr.release();

      return this.postsService.getPostById(post.id);
    } catch (error) {
      await qr.rollbackTransaction();
      await qr.release();

      throw new InternalServerErrorException('서버 에러가 발생하였습니다.');
    }
  }

  @Patch(':id')
  patchPost(@Param('id') id: string, @Body() postData: UpdatePostDto) {
    return this.postsService.updatePost(+id, postData);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
