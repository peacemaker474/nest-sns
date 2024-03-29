import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction';
import { CustomQueryRunner } from 'src/common/decorator/query-runner.decorator';
import { IsPublic } from 'src/common/decorator/public.decorator';
import { CheckPostOwnerGuard } from './guard/check-post-owner.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @IsPublic()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  @IsPublic()
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @CustomQueryRunner() qr: QueryRunner,
    @User('id') userId: number,
    @Body() postData: CreatePostDto,
  ) {
    const post = await this.postsService.createPost(userId, postData, qr);

    for (let i = 0; i < postData.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          post,
          order: i + 1,
          path: postData.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }

    return this.postsService.getPostById(post.id, qr);
  }

  @Patch(':id')
  @UseGuards(CheckPostOwnerGuard)
  patchPost(@Param('id') id: string, @Body() postData: UpdatePostDto) {
    return this.postsService.updatePost(+id, postData);
  }

  @Delete(':id')
  @UseGuards(CheckPostOwnerGuard)
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(+id);
  }
}
