import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { IsString } from 'class-validator';
import { UsersModel } from 'src/users/entities/users.entity';

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: '제목은 문자열을 입력해줘야 합니다.',
  })
  title: string;

  @Column()
  @IsString({
    message: '내용은 문자열을 입력해줘야 합니다.',
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
