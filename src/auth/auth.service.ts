import * as bcrypt from 'bcrypt';

import { Injectable, UnauthorizedException } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ENV_KEY } from 'src/common/constants/env';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersModel } from 'src/users/entity/users.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configServce: ConfigService,
  ) {}

  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configServce.get<string>(ENV_KEY.JWT_SECRET_KEY),
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
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

  async registerWithEmail(registerData: RegisterUserDto) {
    const hashPassword = await bcrypt.hash(
      registerData.password,
      this.configServce.get<string>(ENV_KEY.HASH_ROUNDS),
    );

    const newUser = await this.usersService.createUser({
      ...registerData,
      password: hashPassword,
    });

    return this.loginUser(newUser);
  }

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');

    const prefixToken = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefixToken) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf-8');

    const splitDecodedToken = decoded.split(':');

    if (splitDecodedToken.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const [email, password] = splitDecodedToken;

    return {
      email,
      password,
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configServce.get<string>(ENV_KEY.JWT_SECRET_KEY),
      });
    } catch {
      throw new UnauthorizedException('토큰이 만료됐거나, 잘못된 토큰입니다.');
    }
  }

  reissueToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: this.configServce.get<string>(ENV_KEY.JWT_SECRET_KEY),
    });

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 리프레쉬 토큰으로만 가능합니다.',
      );
    }

    return this.signToken(
      {
        ...decoded,
      },
      isRefreshToken,
    );
  }
}
