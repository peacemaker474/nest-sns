import { Controller, Get } from '@nestjs/common';

import { PostsService } from './posts.service';

interface Post {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commnetCount: number;
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPost(): Post {
    return {
      author: 'admin',
      title: 'Hi',
      content: 'Hi',
      likeCount: 32,
      commnetCount: 12,
    };
  }
}
