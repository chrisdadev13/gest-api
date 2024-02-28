import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO, RegisterDTO } from './dto/auth.dto';

import bcrypt from 'bcrypt';
import { ErrorMessage } from 'src/utils/error';
import { Payload } from './utils/payload';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Config } from 'src/config/schema';
import { randomBytes } from 'crypto';

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

    if (!storedRefreshToken || storedRefreshToken !== token)
      throw new ForbiddenException();
  }

  async register({ email, name, password }: RegisterDTO) {
    const userExists = await this.userService.user({ email });
    if (userExists) {
      throw new BadRequestException(ErrorMessage.UserAlreadyExists);
    }

    const hashedPassword = await this.hash(password);

    const user = await this.userService.createUser({
      email,
      name,
      password: hashedPassword,
    });

    return user;
  }

  async login({ email, password }: LoginDTO) {
    const user = await this.userService.user({ email });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessage.InvalidCredentials);
    }

    return user;
  }
}
