import { Column, Entity, ManyToOne } from 'typeorm';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { BaseModel } from './base.entity';
import { POST_IMAGE_PATH } from '../constants/path';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { Transform } from 'class-transformer';
import { join } from 'path';

export enum ImageModelType {
  POST_IMAGE,
}

@Entity()
export class ImageModel extends BaseModel {
  @Column({
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order: number;

  @Column({
    enum: ImageModelType,
  })
  @IsString()
  @IsEnum(ImageModelType)
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    if (obj.type === ImageModelType.POST_IMAGE) {
      return join(POST_IMAGE_PATH, value);
    } else {
      return value;
    }
  })
  path: string;

  @ManyToOne(() => PostsModel, (post) => post.images)
  post?: PostsModel;
}
