import { Column, Entity, OneToMany } from 'typeorm';
import { IsEmail, IsString, Length } from 'class-validator';

import { BaseModel } from 'src/common/entity/base.entity';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { USER_ROLE } from '../constants/roles.enum';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  @IsString()
  @Length(1, 20, {
    message: '닉네임은 1~20자 사이로 입력해주세요.',
  })
  nickname: string;

  @Column({ unique: true })
  @IsString()
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @Length(3, 8)
  password: string;

  @Column({
    enum: Object.values(USER_ROLE),
    default: USER_ROLE.USER,
  })
  role: USER_ROLE;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
