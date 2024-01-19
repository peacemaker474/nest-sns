import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.pid;

    if (!postId) {
      throw new BadRequestException('게시글 ID는 필수입니다.');
    }

    const exists = await this.postService.checkPostExistsById(parseInt(postId));

    if (!exists) {
      throw new BadRequestException('존재하지 않는 게시글입니다.');
    }

    next();
  }
}
