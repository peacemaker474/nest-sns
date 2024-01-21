import { Controller, Get } from '@nestjs/common';

import { Roles } from './decorator/roles.decorator';
import { USER_ROLE } from './constants/roles.enum';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLE.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }
}
