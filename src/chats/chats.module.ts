import { AuthModule } from 'src/auth/auth.module';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatsMessagesService } from './messages/messages.service';
import { ChatsModel } from './entity/chats.entity';
import { ChatsService } from './chats.service';
import { CommonModule } from 'src/common/common.module';
import { MessagesController } from './messages/messages.controller';
import { MessagesModel } from './messages/entity/messages.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatsModel, MessagesModel]),
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [ChatsController, MessagesController],
  providers: [ChatsGateway, ChatsService, ChatsMessagesService],
})
export class ChatsModule {}
