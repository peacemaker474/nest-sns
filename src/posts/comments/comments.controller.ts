import { CommentsService } from './comments.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PagniateCommentsDto } from './dto/paginate-comments.dto';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateCommentsDto } from './dto/patch-comments.dto';
import { IsPublic } from 'src/common/decorator/public.decorator';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @IsPublic()
  getComments(
    @Query() query: PagniateCommentsDto,
    @Param('pid', ParseIntPipe) pid: number,
  ) {
    return this.commentsService.paginateComments(query, pid);
  }

  @Get(':cid')
  @IsPublic()
  getCommnet(@Param('cid', ParseIntPipe) cid: number) {
    return this.commentsService.getCommentById(cid);
  }

  @Post()
  postComment(
    @Param('pid', ParseIntPipe) pid: number,
    @Body() commentData: CreateCommentsDto,
    @User() user: UsersModel,
  ) {
    return this.commentsService.createComment(pid, commentData, user);
  }

  @Patch(':cid')
  async patchComment(
    @Param('cid', ParseIntPipe) cid: number,
    @Body() commentData: UpdateCommentsDto,
  ) {
    return this.commentsService.updateComment(commentData, cid);
  }

  @Delete(':cid')
  async deleteComment(@Param('cid', ParseIntPipe) cid: number) {
    return this.commentsService.deleteComment(cid);
  }
}
