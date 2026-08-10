import { Module } from '@nestjs/common';

import { AdminSuspensionController } from '@suspension/controller/adminSuspension.controller';
import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';
import { SuspensionService } from '@suspension/service/suspension.service';

@Module({
  controllers: [AdminSuspensionController],
  providers: [SuspensionService, UserSuspensionRepository],
  exports: [SuspensionService],
})
export class SuspensionModule {}
