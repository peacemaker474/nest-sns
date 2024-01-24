import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UserFollowersModel } from './entity/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUserFollowersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.increment(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner) {
    const usersRepository = this.getUsersRepository(qr);

    await usersRepository.decrement(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }

  async getAllUsers() {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async createUser(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    const existsNickName = await this.usersRepository.exist({
      where: {
        nickname: user.nickname,
      },
    });

    if (existsNickName) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    const existsEmail = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });

    if (existsEmail) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const userObject = this.usersRepository.create({
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    const result = await this.userFollowersRepository.find({
      where: {
        followee: {
          id: userId,
        },
        isConfirmed: !includeNotConfirmed ? true : false,
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((user) => ({
      id: user.follower.id,
      nickname: user.follower.nickname,
      email: user.follower.email,
      isConfirmed: user.isConfirmed,
    }));
  }

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    const exists = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        followee: true,
        follower: true,
      },
    });

    if (!exists) {
      throw new BadRequestException('존재하지 않는 팔로우 요청입니다.');
    }

    await userFollowersRepository.save({
      ...exists,
      isConfirmed: true,
    });

    return true;
  }

  async deleteFollow(followerId: number, followeeId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUserFollowersRepository(qr);

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }
}
