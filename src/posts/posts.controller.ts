import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { PostsService } from './posts.service';

interface PostModal {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commnetCount: number;
}

let posts: PostModal[] = [
  {
    id: 1,
    author: 'New Jeans',
    title: '뉴진스 민지',
    content: '메이크업 고치고 있는 민지',
    likeCount: 999,
    commnetCount: 23,
  },
  {
    id: 2,
    author: 'New Jeans',
    title: '뉴진스 해린',
    content: '노래 연습하고 있는 해린',
    likeCount: 999,
    commnetCount: 23,
  },
  {
    id: 3,
    author: 'BlackPink',
    title: '블랙핑크 로제',
    content: '종합운동장에서 공연하고 있는 로제',
    likeCount: 999,
    commnetCount: 23,
  },
];

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(): PostModal[] {
    return posts;
  }

  @Get(':id')
  getPost(@Param('id') id: string): PostModal {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const post: PostModal = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commnetCount: 0,
    };

    posts = [...posts, post];

    return post;
  }

  @Patch(':id')
  patchPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const post = this.getPost(id);

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    posts = posts.map((prevPost) => (prevPost.id === +id ? post : prevPost));

    return post;
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    const post = this.getPost(id);

    posts = posts.filter((post) => post.id !== +id);

    return post.id;
  }
}
