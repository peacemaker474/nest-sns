import { CommentsService } from './comments.service';
import { Controller } from '@nestjs/common';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}
}
