import { Module } from '@nestjs/common';
import { AdminController } from '@admin/controller/admin.controller';
import { AdminService } from '@admin/service/admin.service';
import { AdminRepository } from '@admin/repository/admin.repository';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminRepository],
})
export class AdminModule {}
