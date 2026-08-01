import { Module } from '@nestjs/common';

import { AdminModule } from '@admin/module/admin.module';

import { JwtAuthModule } from '@common/auth/jwt.module';
import { NotifierModule } from '@common/notification/notifier.module';

import { AdminQnaController } from '@qna/controller/adminQna.controller';
import { QnaController } from '@qna/controller/qna.controller';
import { QnaRepository } from '@qna/repository/qna.repository';
import { QnaMessageRepository } from '@qna/repository/qnaMessage.repository';
import { QnaService } from '@qna/service/qna.service';

import { UserRepository } from '@user/repository/user.repository';

@Module({
  imports: [AdminModule, NotifierModule, JwtAuthModule],
  controllers: [QnaController, AdminQnaController],
  providers: [QnaService, QnaRepository, QnaMessageRepository, UserRepository],
  exports: [],
})
export class QnaModule {}
