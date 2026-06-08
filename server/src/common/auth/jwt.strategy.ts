import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Payload } from '@common/guard/jwt.guard';
import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: Payload & { iat: number }) {
    await validateNotInvalidated(this.redisService, payload);
    return payload;
  }
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies['refresh_token'];
        },
      ]),
      secretOrKey: configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: Payload & { iat: number }) {
    await validateNotInvalidated(this.redisService, payload);
    return payload;
  }
}

export async function validateNotInvalidated(
  redisService: RedisService,
  payload: Payload & { iat: number },
) {
  const invalidatedAt = await redisService.get(
    `${REDIS_KEYS.USER_INVALIDATED_PREFIX}:${payload.id}`,
  );
  if (invalidatedAt && payload.iat < Number(invalidatedAt)) {
    throw new UnauthorizedException('인증되지 않은 요청입니다.');
  }
}
