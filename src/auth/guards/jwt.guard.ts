import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as cookie from 'cookie';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly userServices: UserService,
    private readonly jwtServices: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.cookie;
    console.log(authHeader);
    const cookies = cookie.parse(authHeader);

    console.log(cookies);

    if (!authHeader)
      throw new UnauthorizedException('Authorization header not found.');

    const { Authentication, Refresh } = cookies;
    if (!Authentication || !Refresh) {
      throw new UnauthorizedException('Invalid token format.');
    }

    const payload = this.jwtServices.decode(Refresh);

    const user = await this.userServices.userById(payload.id);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user;

    return request;
  }
}
