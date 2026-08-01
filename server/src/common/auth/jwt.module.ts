import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtRefreshStrategy, JwtStrategy } from '@common/auth/jwt.strategy';
import {
  JwtGuard,
  OptionalJwtGuard,
  RefreshJwtGuard,
} from '@common/guard/jwt.guard';

@Module({
  providers: [
    JwtService,
    JwtGuard,
    OptionalJwtGuard,
    RefreshJwtGuard,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [JwtService],
})
export class JwtAuthModule {}
