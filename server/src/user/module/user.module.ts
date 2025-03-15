import { Module } from '@nestjs/common';
import { AdminRepository } from '../../admin/repository/admin.repository';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [],
  controllers: [],
  providers: [UserService, AdminRepository, UserRepository],
})
export class UserModule {}
