import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { CommentsController } from './comments.controller';
import { CommentsModel } from './entity/comments.entity';
import { CommentsService } from './comments.service';
import { CommonModule } from 'src/common/common.module';
import { PostExistsMiddleware } from './middleware/post-exists';
import { PostsModule } from '../posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel]),
    CommonModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddleware).forRoutes(CommentsController);
  }
}
