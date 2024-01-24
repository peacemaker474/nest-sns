import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { Roles } from './decorator/roles.decorator';
import { USER_ROLE } from './constants/roles.enum';
import { UsersService } from './users.service';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entity/users.entity';
import { TransactionInterceptor } from 'src/common/interceptor/transaction';
import { CustomQueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLE.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(user.id, includeNotConfirmed);
  }

  @Post('follow/:id')
  async postFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.followUser(user.id, followeeId);
    return true;
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followerId: number,
    @CustomQueryRunner() qr: QueryRunner,
  ) {
    await this.usersService.confirmFollow(followerId, user.id, qr);
    await this.usersService.incrementFollowerCount(user.id, qr);
    return true;
  }

  @Delete('follow/:id')
  @UseInterceptors(TransactionInterceptor)
  async deleteFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @CustomQueryRunner() qr: QueryRunner,
  ) {
    await this.usersService.deleteFollow(user.id, followeeId, qr);
    await this.usersService.decrementFollowerCount(user.id, qr);
    return true;
  }
}
