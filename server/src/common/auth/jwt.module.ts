import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard, RefreshJwtGuard } from '@src/common/guard/jwt.guard';
import { JwtRefreshStrategy, JwtStrategy } from '@src/common/auth/jwt.strategy';
import { InjectUserInterceptor } from '@src/common/auth/jwt.interceptor';

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
