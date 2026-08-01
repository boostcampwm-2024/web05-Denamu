import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { Request } from 'express';

import { getIp } from '@common/util/getIp';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    return Promise.resolve(getIp(req) ?? 'unknown');
  }
}
