import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Payload } from '../guard/jwt.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Payload | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
