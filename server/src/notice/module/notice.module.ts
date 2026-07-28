import { Module } from '@nestjs/common';

import { AdminNoticeController } from '@notice/controller/adminNotice.controller';
import { NoticeController } from '@notice/controller/notice.controller';
import { NoticeRepository } from '@notice/repository/notice.repository';
import { NoticeService } from '@notice/service/notice.service';

import { AdminModule } from '@admin/module/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [NoticeController, AdminNoticeController],
  providers: [NoticeService, NoticeRepository],
  exports: [],
})
export class NoticeModule {}
