import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { Roles } from './decorator/roles.decorator';
import { USER_ROLE } from './constants/roles.enum';
import { UsersService } from './users.service';
import { User } from './decorator/user.decorator';
import { UsersModel } from './entity/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLE.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(@User() user: UsersModel) {
    return this.usersService.getFollowers(user.id);
  }

  @Post('follow/:id')
  async postFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    await this.usersService.followUser(user.id, followeeId);
    return true;
  }
}
