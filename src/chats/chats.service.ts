import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatsModel } from './entity/chats.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { CommonService } from 'src/common/common.service';
import { PaginateChatDto } from './dto/paginate-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatsModel)
    private readonly chatsRepository: Repository<ChatsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateChats(data: PaginateChatDto) {
    return this.commonService.paginate(
      data,
      this.chatsRepository,
      {
        relations: {
          users: true,
        },
      },
      'chats',
    );
  }

  async createChat(users: CreateChatDto) {
    const chat = await this.chatsRepository.save({
      users: users.userIds.map((id) => ({ id })),
    });

    return this.chatsRepository.findOne({
      where: {
        id: chat.id,
      },
    });
  }

  async checkExistChat(chatId: number) {
    const exists = await this.chatsRepository.exist({
      where: {
        id: chatId,
      },
    });

    return exists;
  }
}
