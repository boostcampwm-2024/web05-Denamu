import { Module } from '@nestjs/common';
import { AdminRepository } from '../../admin/repository/admin.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [AdminRepository],
})
export class UserModule {}
