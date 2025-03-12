import { Module } from '@nestjs/common';
import { AdminRepository } from '../../admin/repository/admin.repository';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { EmailModule } from '../../common/email/email.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [RedisModule, EmailModule],
  controllers: [],
  providers: [UserService, AdminRepository, UserRepository],
})
export class UserModule {}
