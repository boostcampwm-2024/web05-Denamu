import { Module } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { JwtAuthModule } from '../../common/auth/jwt.module';
import { AdminModule } from '../../admin/module/admin.module';

@Module({
  imports: [JwtAuthModule, AdminModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
