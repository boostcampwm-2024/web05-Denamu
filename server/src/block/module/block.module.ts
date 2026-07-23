import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { BlockController } from '@block/controller/block.controller';
import { BlockRepository } from '@block/repository/block.repository';
import { BlockService } from '@block/service/block.service';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [JwtAuthModule, UserModule],
  controllers: [BlockController],
  providers: [BlockService, BlockRepository],
  exports: [],
})
export class BlockModule {}
