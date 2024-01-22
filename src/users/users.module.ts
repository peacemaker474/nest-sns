import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';
import { UsersController } from './users.controller';
import { UsersModel } from './entity/users.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel, UserFollowersModel])],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
