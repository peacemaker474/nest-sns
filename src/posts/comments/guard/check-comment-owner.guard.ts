import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { CommentsService } from '../comments.service';
import { Request } from 'express';
import { USER_ROLE } from 'src/users/constants/roles.enum';
import { UsersModel } from 'src/users/entity/users.entity';

@Injectable()
export class CheckCommentOwnerGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

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

    const commentId = request.params.cid;

    if (!commentId) {
      throw new BadRequestException(
        '댓글 ID를 제공해야 합니다. 다시 한 번 확인해주세요.',
      );
    }

    const isOwnerComment = await this.commentsService.checkOwnerComment(
      user.id,
      parseInt(commentId),
    );

    if (isOwnerComment) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
