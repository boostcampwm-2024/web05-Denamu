import { Module } from '@nestjs/common';

import { AdminModule } from '@admin/module/admin.module';

import { AdminMarketingEmailController } from '@marketingEmail/controller/adminMarketingEmail.controller';
import { MarketingEmailRepository } from '@marketingEmail/repository/marketingEmail.repository';
import { MarketingEmailService } from '@marketingEmail/service/marketingEmail.service';

import { UserRepository } from '@user/repository/user.repository';

@Module({
  imports: [AdminModule],
  controllers: [AdminMarketingEmailController],
  providers: [MarketingEmailService, MarketingEmailRepository, UserRepository],
  exports: [],
})
export class MarketingEmailModule {}
