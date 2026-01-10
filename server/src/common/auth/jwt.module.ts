import { InjectUserInterceptor } from '@common/auth/jwt.interceptor';
import { JwtRefreshStrategy, JwtStrategy } from '@common/auth/jwt.strategy';
import { JwtGuard, RefreshJwtGuard } from '@common/guard/jwt.guard';

import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    JwtService,
    JwtGuard,
    RefreshJwtGuard,
    JwtStrategy,
    JwtRefreshStrategy,
    InjectUserInterceptor,
  ],
  exports: [JwtService],
})
export class JwtAuthModule {}
