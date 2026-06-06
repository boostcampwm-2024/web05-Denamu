import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request } from 'express';

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request['user'] as { loginId: string }).loginId;
  },
);
