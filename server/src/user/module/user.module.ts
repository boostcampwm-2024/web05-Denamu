import { Module } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { OAuthController } from '../controller/oauth.controller';
import { OAuthService } from '../service/oauth.service';
import { ProviderRepository } from '../repository/provider.repository';
import { JwtAuthModule } from '../../common/auth/jwt.module';
import { AdminModule } from '../../admin/module/admin.module';
import { GoogleOAuthProvider } from '../provider/google.provider';
import { GithubOAuthProvider } from '../provider/github.provider';

@Module({
  imports: [JwtAuthModule, AdminModule],
  controllers: [UserController, OAuthController],
  providers: [
    UserService,
    OAuthService,
    UserRepository,
    ProviderRepository,
    GoogleOAuthProvider,
    GithubOAuthProvider,
    {
      provide: 'OAUTH_PROVIDERS',
      useFactory: (
        google: GoogleOAuthProvider,
        github: GithubOAuthProvider,
      ) => ({
        google,
        github,
      }),
      inject: [GoogleOAuthProvider],
    },
  ],
  exports: [UserRepository],
})
export class UserModule {}
