import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { IsString } from 'class-validator';
import { UsersModel } from 'src/users/entities/users.entity';
import { validationStringMessage } from 'src/common/validation/message';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: validationStringMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: validationStringMessage,
  })
  content: string;

  @Column({
    nullable: true,
  })
  image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
