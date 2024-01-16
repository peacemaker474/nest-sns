import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { ChatsModel } from './entity/chats.entity';
import { ChatsService } from './chats.service';
import { CommonModule } from 'src/common/common.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ChatsModel]), CommonModule],
  controllers: [ChatsController],
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
