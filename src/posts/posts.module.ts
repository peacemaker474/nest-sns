import { AuthModule } from 'src/auth/auth.module';
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsModel } from './entities/posts.entity';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostsModel]), AuthModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
