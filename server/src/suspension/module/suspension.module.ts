import { Module } from '@nestjs/common';

import { AdminRepository } from '@admin/repository/admin.repository';

import { AdminSuspensionController } from '@suspension/controller/adminSuspension.controller';
import { RssSuspensionRepository } from '@suspension/repository/rssSuspension.repository';
import { UserSuspensionRepository } from '@suspension/repository/userSuspension.repository';
import { SuspensionService } from '@suspension/service/suspension.service';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminSuspensionController],
  providers: [
    SuspensionService,
    UserSuspensionRepository,
    RssSuspensionRepository,
    AdminRepository,
  ],
  exports: [SuspensionService],
})
export class SuspensionModule {}
