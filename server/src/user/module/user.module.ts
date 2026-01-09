import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserRepository } from '@src/user/repository/user.repository';
import { UserService } from '@src/user/service/user.service';
import { UserController } from '@src/user/controller/user.controller';
import { OAuthController } from '@src/user/controller/oAuth.controller';
import { OAuthService } from '@src/user/service/oAuth.service';
import { ProviderRepository } from '@src/user/repository/provider.repository';
import { JwtAuthModule } from '@src/common/auth/jwt.module';
import { AdminModule } from '@src/admin/module/admin.module';
import { GoogleOAuthProvider } from '@src/user/provider/google.provider';
import { GithubOAuthProvider } from '@src/user/provider/github.provider';
import { UserScheduler } from '@src/user/scheduler/user.scheduler';
import { FileModule } from '@src/file/module/file.module';

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
