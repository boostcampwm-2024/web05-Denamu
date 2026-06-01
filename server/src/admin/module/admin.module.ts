import { Module } from '@nestjs/common';

import { AdminController } from '@admin/controller/admin.controller';
import { AdminRepository } from '@admin/repository/admin.repository';
import { AdminService } from '@admin/service/admin.service';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [],
})
export class AdminModule {}
