import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard, RefreshJwtGuard } from '@common/guard/jwt.guard';
import { JwtRefreshStrategy, JwtStrategy } from '@common/auth/jwt.strategy';
import { InjectUserInterceptor } from '@common/auth/jwt.interceptor';

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
