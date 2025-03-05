import { Module } from '@nestjs/common';
import { AdminController } from '../controller/admin.controller';
import { AdminService } from '../service/admin.service';
import { AdminRepository } from '../repository/admin.repository';

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository],
})
export class AdminModule {}
