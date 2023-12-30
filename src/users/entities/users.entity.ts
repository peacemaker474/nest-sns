import { Column, Entity, OneToMany } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { USER_ROLE } from '../constants/roles.enum';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(USER_ROLE),
    default: USER_ROLE.USER,
  })
  role: USER_ROLE;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
