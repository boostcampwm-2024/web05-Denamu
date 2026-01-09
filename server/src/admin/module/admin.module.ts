import { Module } from '@nestjs/common';
import { AdminController } from '@src/admin/controller/admin.controller';
import { AdminService } from '@src/admin/service/admin.service';
import { AdminRepository } from '@src/admin/repository/admin.repository';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
  exports: [AdminRepository],
})
export class AdminModule {}
