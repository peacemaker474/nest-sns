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
  UseInterceptors,
} from '@nestjs/common';
import { PagniateCommentsDto } from './dto/paginate-comments.dto';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateCommentsDto } from './dto/patch-comments.dto';
import { IsPublic } from 'src/common/decorator/public.decorator';
import { CheckCommentOwnerGuard } from './guard/check-comment-owner.guard';
import { TransactionInterceptor } from 'src/common/interceptor/transaction';
import { CustomQueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner } from 'typeorm';
import { PostsService } from '../posts.service';

@Controller('posts/:pid/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {}

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
  @UseInterceptors(TransactionInterceptor)
  async postComment(
    @Param('pid', ParseIntPipe) pid: number,
    @Body() commentData: CreateCommentsDto,
    @User() user: UsersModel,
    @CustomQueryRunner() qr: QueryRunner,
  ) {
    const commnets = await this.commentsService.createComment(
      pid,
      commentData,
      user,
      qr,
    );
    await this.postsService.incrementCommentCount(pid, qr);
    return commnets;
  }

  @Patch(':cid')
  @UseGuards(CheckCommentOwnerGuard)
  async patchComment(
    @Param('cid', ParseIntPipe) cid: number,
    @Body() commentData: UpdateCommentsDto,
  ) {
    return this.commentsService.updateComment(commentData, cid);
  }

  @Delete(':cid')
  @UseGuards(CheckCommentOwnerGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('cid', ParseIntPipe) cid: number,
    @Param('pid', ParseIntPipe) pid: number,
    @CustomQueryRunner() qr: QueryRunner,
  ) {
    const deleteId = await this.commentsService.deleteComment(cid, qr);
    await this.postsService.decrementCommentCount(pid, qr);

    return deleteId;
  }
}
