import { Module } from '@nestjs/common';
import { AdminRepository } from '../../admin/repository/admin.repository';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { JwtAuthModule } from '../../common/auth/jwt.module';

@Module({
  imports: [JwtAuthModule],
  controllers: [UserController],
  providers: [UserService, AdminRepository, UserRepository],
})
export class UserModule {}
