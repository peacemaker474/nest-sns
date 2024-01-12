import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { BaseModel } from 'src/common/entity/base.entity';
import { ImageModel } from 'src/common/entity/image.entity';
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
  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany(() => ImageModel, (image) => image.post)
  images: ImageModel[];
}
