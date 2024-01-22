import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

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

  async getFollowers(userId: number): Promise<UsersModel[]> {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        followers: true,
      },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 팔로워입니다.');
    }

    return user.followers;
  }

  async followUser(followerId: number, followeeId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: followerId,
      },
      relations: {
        followees: true,
      },
    });

    if (!user) {
      throw new BadRequestException('존재하지 않는 팔로워입니다.');
    }

    await this.usersRepository.save({
      ...user,
      followees: [
        ...user.followees,
        {
          id: followeeId,
        },
      ],
    });
  }
}
