import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { AccessTokenGuard } from './auth/guard/bearer-token.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatsModel } from './chats/entity/chats.entity';
import { ChatsModule } from './chats/chats.module';
import { CommentsModel } from './posts/comments/entity/comments.entity';
import { CommentsModule } from './posts/comments/comments.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ImageModel } from './common/entity/image.entity';
import { MessagesModel } from './chats/messages/entity/messages.entity';
import { PUBLIC_FOLDER_PATH } from './common/constants/path';
import { PostsModel } from './posts/entity/posts.entity';
import { PostsModule } from './posts/posts.module';
import { RolesGuard } from './users/guard/roles.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollowersModel } from './users/entity/user-followers.entity';
import { UsersModel } from './users/entity/users.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        PostsModel,
        UsersModel,
        ImageModel,
        ChatsModel,
        MessagesModel,
        CommentsModel,
        UserFollowersModel,
      ],
      synchronize: true, // Production 환경에서는 false
    }),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),
    UsersModule,
    PostsModule,
    AuthModule,
    CommonModule,
    ChatsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
