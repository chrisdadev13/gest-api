import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO, RegisterDTO } from './dto/auth.dto';

import { ErrorMessage } from 'src/utils/error';
import { Payload } from './utils/payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config/schema';
import { randomBytes } from 'crypto';

import * as bcrypt from 'bcryptjs';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(
    grantType: 'access' | 'refresh' | 'reset' | 'verification',
    payload?: Payload,
  ) {
    switch (grantType) {
      case 'access':
        if (!payload)
          throw new InternalServerErrorException('InvalidTokenPayload');

        return this.jwtService.sign(payload, {
          secret: this.configService.getOrThrow('ACCESS_TOKEN_SECRET'),
          expiresIn: '15m',
        });
      case 'refresh':
        if (!payload)
          throw new InternalServerErrorException('InvalidTokenPayload');

        return this.jwtService.sign(payload, {
          secret: this.configService.getOrThrow('REFRESH_TOKEN_SECRET'),
          expiresIn: '2d',
        });
      case 'reset':
      case 'verification':
        return randomBytes(32).toString('base64url');
      default:
        throw new InternalServerErrorException(
          'InvalidGrantType: ' + grantType,
        );
    }
  }

  async setRefreshToken(email: string, token: string | null) {
    await this.userService.updateUser({
      where: { email },
      data: {
        secrets: {
          update: {
            refreshToken: token,
            lastSignedIn: token ? new Date() : undefined,
          },
        },
      },
    });
  }

  async validateRefreshToken(payload: Payload, token: string) {
    const user = await this.userService.userById(payload.id);
    const storedRefreshToken = user.secrets?.refreshToken;

    if (!storedRefreshToken || storedRefreshToken !== token) {
      throw new ForbiddenException();
    }
  }

  async register({ email, name, password }: RegisterDTO) {
    try {
      const userExists = await this.userService.user({ email });
      if (userExists) {
        throw new BadRequestException(ErrorMessage.UserAlreadyExists);
      }

      const hashedPassword = await this.hash(password);

      const user = await this.userService.createUser({
        email,
        name,
        password: hashedPassword,
        secrets: {
          create: {
            password: hashedPassword,
          },
        },
      });

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        ErrorMessage.SomethingWentWrong,
      );
    }
  }

  async login({ email, password }: LoginDTO) {
    const user = await this.userService.user({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessage.InvalidCredentials);
    }

    return user;
  }
}
