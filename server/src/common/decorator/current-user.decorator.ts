import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from '@common/guard/jwt.guard';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Payload | null => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) return null;
    return user as Payload;
  },
);
