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
  UseGuards,
} from '@nestjs/common';
import { PagniateCommentsDto } from './dto/paginate-comments.dto';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateCommentsDto } from './dto/patch-comments.dto';

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

  @Get(':cid')
  getCommnet(@Param('cid', ParseIntPipe) cid: number) {
    return this.commentsService.getCommentById(cid);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  postComment(
    @Param('pid', ParseIntPipe) pid: number,
    @Body() commentData: CreateCommentsDto,
    @User() user: UsersModel,
  ) {
    return this.commentsService.createComment(pid, commentData, user);
  }

  @Patch(':cid')
  @UseGuards(AccessTokenGuard)
  async patchComment(
    @Param('cid', ParseIntPipe) cid: number,
    @Body() commentData: UpdateCommentsDto,
  ) {
    return this.commentsService.updateComment(commentData, cid);
  }

  @Delete(':cid')
  @UseGuards(AccessTokenGuard)
  async deleteComment(@Param('cid', ParseIntPipe) cid: number) {
    return this.commentsService.deleteComment(cid);
  }
}
