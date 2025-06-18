import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard, RefreshJwtGuard } from '../guard/jwt.guard';
import { JwtRefreshStrategy, JwtStrategy } from './jwt.strategy';

@Module({
  providers: [
    JwtService,
    JwtGuard,
    RefreshJwtGuard,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [JwtService],
})
export class JwtAuthModule {}
