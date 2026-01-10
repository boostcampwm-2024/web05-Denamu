import { AdminController } from '@admin/controller/admin.controller';
import { AdminRepository } from '@admin/repository/admin.repository';
import { AdminService } from '@admin/service/admin.service';

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminRepository],
})
export class AdminModule {}
