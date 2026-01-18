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
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Payload) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const blacklistKey = `${REDIS_KEYS.USER_BLACKLIST_JWT_PREFIX}:${token}`;
      const isBlacklisted = await this.redisService.get(blacklistKey);

      if (isBlacklisted) {
        throw new UnauthorizedException('인증되지 않은 요청입니다.');
      }
    }
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
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Payload) {
    const token = req.cookies['refresh_token'];
    if (token) {
      const blacklistKey = `${REDIS_KEYS.USER_BLACKLIST_JWT_PREFIX}:${token}`;
      const isBlacklisted = await this.redisService.get(blacklistKey);

      if (isBlacklisted) {
        throw new UnauthorizedException('인증되지 않은 요청입니다.');
      }
    }
    return payload;
  }
}
