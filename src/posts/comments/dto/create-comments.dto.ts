import { CommentsModel } from '../entity/comments.entity';
import { PickType } from '@nestjs/mapped-types';

export class CreateCommentsDto extends PickType(CommentsModel, ['comment']) {}
