import { CommonService } from 'src/common/common.service';
import { Injectable } from '@nestjs/common';
import { PagniateCommentsDto } from './dto/paginate-comments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  paginateComments(query: PagniateCommentsDto, pid: number) {
    return this.commonService.paginate(
      query,
      this.commentsRepository,
      {
        where: {
          post: {
            id: pid,
          },
        },
      },
      `posts/${pid}/commnets`,
    );
  }
}
