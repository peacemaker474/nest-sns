import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { HOST, PROTOCOL } from 'src/common/constants/env';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async paginatePosts(query: PaginatePostDto) {
    if (query.page) {
      return this.pagePaginatePosts(query);
    }

    return this.cursorPaginatePosts(query);
  }

  async pagePaginatePosts(query: PaginatePostDto) {
    const [data, count] = await this.postsRepository.findAndCount({
      skip: query.take * (query.page - 1),
      order: {
        createdAt: query.order__createdAt,
      },
      take: query.take,
    });

    return {
      data,
      count,
    };
  }

  async cursorPaginatePosts(query: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (query.where__id__less_than) {
      where.id = LessThan(query.where__id__less_than);
    } else if (query.where__id__more_than) {
      where.id = MoreThan(query.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: query.order__createdAt,
      },
      take: query.take,
    });

    const lastPost =
      posts.length > 0 && posts.length === query.take
        ? posts[posts.length - 1]
        : null;
    const nextUrl = lastPost && new URL(`${PROTOCOL}://${HOST}/posts`);

    if (nextUrl) {
      for (const key of Object.keys(query)) {
        if (
          query[key] &&
          key !== 'where__id__more_than' &&
          key !== 'where__id__less_than'
        ) {
          nextUrl.searchParams.append(key, query[key]);
        }
      }

      let key = null;

      if (query.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastPost.id.toString());
    }

    return {
      data: posts,
      cursor: {
        after: lastPost?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postData: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postData,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(postId: number, postData: UpdatePostDto) {
    const { title, content } = postData;
    const post = await this.getPostById(postId);

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.getPostById(postId);

    await this.postsRepository.delete(post.id);

    return post.id;
  }
}
