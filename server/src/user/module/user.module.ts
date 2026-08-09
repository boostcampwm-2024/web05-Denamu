import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';
import { LoginThrottlerModule } from '@common/throttler/login-throttler.module';

import { FeedRepository } from '@feed/repository/feed.repository';

import { FileModule } from '@file/module/file.module';

import { RssModule } from '@rss/module/rss.module';

import { SubscriptionRepository } from '@subscribe/repository/subscription.repository';

import { OAuthController } from '@user/controller/oAuth.controller';
import { UserController } from '@user/controller/user.controller';
import { GithubOAuthProvider } from '@user/provider/github.provider';
import { GoogleOAuthProvider } from '@user/provider/google.provider';
import { ProviderRepository } from '@user/repository/provider.repository';
import { UserRepository } from '@user/repository/user.repository';
import { WithdrawnUserRepository } from '@user/repository/withdrawnUser.repository';
import { UserScheduler } from '@user/scheduler/user.scheduler';
import { OAuthService } from '@user/service/oAuth.service';
import { UserService } from '@user/service/user.service';

@Module({
  imports: [JwtAuthModule, FileModule, RssModule, LoginThrottlerModule],
  controllers: [UserController, OAuthController],
  providers: [
    UserService,
    OAuthService,
    UserRepository,
    WithdrawnUserRepository,
    ProviderRepository,
    FeedRepository,
    SubscriptionRepository,
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
  exports: [UserService],
})
export class UserModule {}
