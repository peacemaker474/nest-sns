import { CommonService } from 'src/common/common.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PagniateCommentsDto } from './dto/paginate-comments.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UpdateCommentsDto } from './dto/patch-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

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
        relations: {
          author: true,
        },
        select: {
          author: {
            id: true,
            nickname: true,
          },
        },
      },
      `posts/${pid}/commnets`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id,
      },
      relations: {
        author: true,
      },
      select: {
        author: {
          id: true,
          nickname: true,
        },
      },
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    return comment;
  }

  async createComment(
    postId: number,
    commentData: CreateCommentsDto,
    author: UsersModel,
    qr?: QueryRunner,
  ) {
    const commentsRepository = this.getRepository(qr);

    return commentsRepository.save({
      ...commentData,
      post: {
        id: postId,
      },
      author,
    });
  }

  async updateComment(commentData: UpdateCommentsDto, cid: number) {
    const comment = await this.getCommentById(cid);

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    const beforeComment = await this.commentsRepository.preload({
      ...commentData,
      id: cid,
    });

    const newComment = await this.commentsRepository.save(beforeComment);

    return newComment;
  }

  async deleteComment(id: number, qr?: QueryRunner) {
    const comment = await this.getCommentById(id);
    const commentsRepository = this.getRepository(qr);

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    await commentsRepository.delete(id);

    return id;
  }

  async checkOwnerComment(userId: number, commentId: number) {
    return this.commentsRepository.exist({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
