import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserRepository } from '../repository/user.repository';
import { UserService } from '../service/user.service';
import { UserController } from '../controller/user.controller';
import { OAuthController } from '../controller/oAuth.controller';
import { OAuthService } from '../service/oauth.service';
import { ProviderRepository } from '../repository/provider.repository';
import { JwtAuthModule } from '../../common/auth/jwt.module';
import { AdminModule } from '../../admin/module/admin.module';
import { GoogleOAuthProvider } from '../provider/google.provider';
import { GithubOAuthProvider } from '../provider/github.provider';
import { UserScheduler } from '../scheduler/user.scheduler';

@Module({
  imports: [JwtAuthModule, AdminModule, ScheduleModule.forRoot()],
  controllers: [UserController, OAuthController],
  providers: [
    UserService,
    OAuthService,
    UserRepository,
    ProviderRepository,
    GoogleOAuthProvider,
    GithubOAuthProvider,
    UserScheduler,
    {
      provide: 'OAUTH_PROVIDERS',
      useFactory: (
        google: GoogleOAuthProvider,
        github: GithubOAuthProvider,
      ) => ({
        google,
        github,
      }),
      inject: [GoogleOAuthProvider, GithubOAuthProvider],
    },
  ],
  exports: [UserRepository, UserService],
})
export class UserModule {}
