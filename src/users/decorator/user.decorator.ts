import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

import { UsersModel } from '../entity/users.entity';

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException(
        '요청 정보에 유저 정보가 존재하지 않습니다.',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
