import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard, RefreshJwtGuard } from '../guard/jwt.guard';
import { JwtRefreshStrategy, JwtStrategy } from './jwt.strategy';
import { InjectUserInterceptor } from './jwt.interceptor';

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
