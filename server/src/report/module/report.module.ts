import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';

import { CommentRepository } from '@comment/repository/comment.repository';

import { FeedModule } from '@feed/module/feed.module';

import { AdminReportController } from '@report/controller/adminReport.controller';
import { ReportController } from '@report/controller/report.controller';
import { ReportRepository } from '@report/repository/report.repository';
import { ReportService } from '@report/service/report.service';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserModule } from '@user/module/user.module';

@Module({
  imports: [JwtAuthModule, UserModule, FeedModule],
  controllers: [ReportController, AdminReportController],
  providers: [ReportService, ReportRepository, RssAcceptRepository, CommentRepository],
  exports: [],
})
export class ReportModule {}
