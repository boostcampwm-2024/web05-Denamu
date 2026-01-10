import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

import { Payload } from '@common/guard/jwt.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Payload | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) return null;
    return user as Payload;
  },
);
