import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { ChatsModel } from 'src/chats/entity/chats.entity';
import { IsString } from 'class-validator';
import { UsersModel } from 'src/users/entity/users.entity';

@Entity()
export class MessagesModel extends BaseModel {
  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel;

  @ManyToOne(() => UsersModel, (user) => user.messages)
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}
