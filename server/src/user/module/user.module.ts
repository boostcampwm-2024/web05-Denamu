import { Module } from '@nestjs/common';
import { AdminRepository } from '../../admin/repository/admin.repository';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { JwtService } from '@nestjs/jwt';
import { OAuthController } from '../controller/oauth.controller';
import { OAuthService } from '../service/oauth.service';
import { ProviderRepository } from '../repository/provider.repository';

@Module({
  imports: [],
  controllers: [UserController, OAuthController],
  providers: [
    UserService,
    OAuthService,
    AdminRepository,
    UserRepository,
    JwtService,
    ProviderRepository,
  ],
})
export class UserModule {}
