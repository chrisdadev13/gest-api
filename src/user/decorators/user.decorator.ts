import { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { User as UserEntity } from '@prisma/client';
import { Request } from 'express';

export const User = createParamDecorator(
  (data: keyof UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request & {
      user: UserEntity;
    };

    const user = request.user;

    return data ? user?.[data] : user;
  },
);
