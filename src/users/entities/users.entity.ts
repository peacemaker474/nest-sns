import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PostsModel } from 'src/posts/entities/posts.entity';
import { USER_ROLE } from '../constants/roles.enum';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

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
