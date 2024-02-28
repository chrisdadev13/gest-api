import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './dto/auth.dto';
import { ErrorMessage } from 'src/utils/error';
import { payloadSchema } from './utils/payload';
import type { Response } from 'express';
import { getCookieOptions } from './utils/cookie';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private async exchangeToken(
    id: number,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = payloadSchema.parse({ id, email });

      const accessToken = this.authService.generateToken('access', payload);
      const refreshToken = this.authService.generateToken('refresh', payload);

      await this.authService.setRefreshToken(email, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        ErrorMessage.SomethingWentWrong,
      );
    }
  }

  private async handleAuthenticationResponse(user: User, response: Response) {
    const { accessToken, refreshToken } = await this.exchangeToken(
      user.id,
      user.email,
    );

    response.cookie('Authentication', accessToken, getCookieOptions('access'));
    response.cookie('Refresh', refreshToken, getCookieOptions('refresh'));

    response.status(200).send({
      accessToken,
      refreshToken,
      id: user.id,
      email: user.email,
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDTO, @Res() response: Response) {
    const user = await this.authService.register(registerDto);

    return this.handleAuthenticationResponse(user, response);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(loginDto);

    return this.handleAuthenticationResponse(user, response);
  }
}
