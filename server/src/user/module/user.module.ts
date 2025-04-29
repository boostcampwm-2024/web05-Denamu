import { Module } from '@nestjs/common';
import { AdminRepository } from '../../admin/repository/admin.repository';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { OAuthController } from '../controller/oauth.controller';
import { OAuthService } from '../service/oauth.service';
import { ProviderRepository } from '../repository/provider.repository';
import { JwtAuthModule } from '../../common/auth/jwt.module';
import { GoogleOAuthProvider } from '../provider/google.provider';

@Module({
  imports: [JwtAuthModule],
  controllers: [UserController, OAuthController],
  providers: [
    UserService,
    OAuthService,
    AdminRepository,
    UserRepository,
    ProviderRepository,
    GoogleOAuthProvider,
    {
      provide: 'OAUTH_PROVIDERS',
      useFactory: (google: GoogleOAuthProvider) => ({
        google,
      }),
      inject: [GoogleOAuthProvider],
    },
  ],
})
export class UserModule {}
