import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { IsString } from 'class-validator';
import { POST_PUBLIC_IMAGE_PATH } from 'src/common/constants/path';
import { Transform } from 'class-transformer';
import { UsersModel } from 'src/users/entities/users.entity';
import { join } from 'path';
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
  @Transform(({ value }) => value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`)
  image?: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
