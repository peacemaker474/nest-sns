import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';

export interface PostModal {
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

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  getAllPosts() {
    return posts;
  }

  getPostById(postId: number) {
    const post = posts.find((post) => post.id === postId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  createPost(author: string, title: string, content: string) {
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

  updatePost(
    postId: number,
    author?: string,
    title?: string,
    content?: string,
  ) {
    const post = this.getPostById(postId);

    if (author) {
      post.author = author;
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    posts = posts.map((prevPost) => (prevPost.id === postId ? post : prevPost));

    return post;
  }

  deletePost(postId: number) {
    const post = this.getPostById(postId);

    posts = posts.filter((post) => post.id !== postId);

    return post.id;
  }
}
