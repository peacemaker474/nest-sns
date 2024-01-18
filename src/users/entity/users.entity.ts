import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { IsEmail, IsString, Length } from 'class-validator';
import {
  validationEmailMessage,
  validationLengthMessage,
  validationStringMessage,
} from 'src/common/validation/message';

import { BaseModel } from 'src/common/entity/base.entity';
import { ChatsModel } from 'src/chats/entity/chats.entity';
import { Exclude } from 'class-transformer';
import { MessagesModel } from 'src/chats/messages/entity/messages.entity';
import { PostsModel } from 'src/posts/entity/posts.entity';
import { USER_ROLE } from '../constants/roles.enum';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: validationStringMessage,
  })
  @Length(1, 20, {
    message: validationLengthMessage,
  })
  nickname: string;

  @Column({ unique: true })
  @IsString({
    message: validationStringMessage,
  })
  @IsEmail(
    {},
    {
      message: validationEmailMessage,
    },
  )
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  @IsString({
    message: validationStringMessage,
  })
  @Length(3, 8, {
    message: validationLengthMessage,
  })
  password: string;

  @Column({
    enum: Object.values(USER_ROLE),
    default: USER_ROLE.USER,
  })
  role: USER_ROLE;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;
}
