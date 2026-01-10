import { AdminModule } from '@admin/module/admin.module';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { FileModule } from '@file/module/file.module';

import { OAuthController } from '@user/controller/oAuth.controller';
import { UserController } from '@user/controller/user.controller';
import { GithubOAuthProvider } from '@user/provider/github.provider';
import { GoogleOAuthProvider } from '@user/provider/google.provider';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';
import { UserScheduler } from '@user/scheduler/user.scheduler';
import { OAuthService } from '@user/service/oAuth.service';
import { UserService } from '@user/service/user.service';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [JwtAuthModule, AdminModule, FileModule, ScheduleModule.forRoot()],
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
