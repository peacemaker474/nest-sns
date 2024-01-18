import { CommentsService } from './comments.service';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PagniateCommentsDto } from './dto/paginate-comments.dto';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  getComments(
    @Query() query: PagniateCommentsDto,
    @Param('pid', ParseIntPipe) pid: number,
  ) {
    return this.commentsService.paginateComments(query, pid);
  }
}
