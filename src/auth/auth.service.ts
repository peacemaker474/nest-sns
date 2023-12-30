import * as bcrypt from 'bcrypt';

import { HASH_ROUNDS, JWT_SECRET } from './constants/auth';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToekn: this.signToken(user, true),
    };
  }

  async authenticatedWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    const existedUser = await this.usersService.getUserByEmail(user.email);

    if (!existedUser) {
      throw new UnauthorizedException('존재하지 않는 사용자입니다.');
    }

    const checkPassword = await bcrypt.compare(
      user.password,
      existedUser.password,
    );

    if (!checkPassword) {
      throw new UnauthorizedException('비밀번호가 틀렸습니다.');
    }

    return existedUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existedUser = await this.authenticatedWithEmailAndPassword(user);

    return this.loginUser(existedUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'email' | 'nickname' | 'password'>,
  ) {
    const hashPassword = bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser(user);

    return this.loginUser(newUser);
  }
}
