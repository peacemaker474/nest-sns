import { IsOptional, IsString } from 'class-validator';

import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString()
  @IsOptional()
  image?: string;
}
