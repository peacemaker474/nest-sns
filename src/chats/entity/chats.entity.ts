import { Entity, ManyToMany, OneToMany } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { MessagesModel } from '../messages/entity/messages.entity';
import { UsersModel } from 'src/users/entity/users.entity';

@Entity()
export class ChatsModel extends BaseModel {
  @ManyToMany(() => UsersModel, (user) => user.chats)
  users: UsersModel[];

  @OneToMany(() => MessagesModel, (message) => message.chat)
  messages: MessagesModel[];
}
