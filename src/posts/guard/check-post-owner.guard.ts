import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PostsService } from '../posts.service';
import { Request } from 'express';
import { USER_ROLE } from 'src/users/constants/roles.enum';
import { UsersModel } from 'src/users/entity/users.entity';

@Injectable()
export class CheckPostOwnerGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    if (user.role === USER_ROLE.ADMIN) {
      return true;
    }

    const postId = request.params.id;

    if (!postId) {
      throw new BadRequestException(
        '게시물 ID를 제공해야 합니다. 다시 한 번 확인해주세요.',
      );
    }

    const isOwner = this.postsService.isPostOwner(user.id, parseInt(postId));

    if (!isOwner) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
