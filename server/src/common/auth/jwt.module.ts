import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard, RefreshJwtGuard } from '../guard/jwt.guard';

@Module({
  providers: [JwtService, JwtGuard, RefreshJwtGuard],
})
export class JwtAuthModule {}
