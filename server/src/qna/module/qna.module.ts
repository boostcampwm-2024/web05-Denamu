import { Module } from '@nestjs/common';

import { JwtAuthModule } from '@common/auth/jwt.module';
import { NotifierModule } from '@common/notification/notifier.module';

import { QnaController } from '@qna/controller/qna.controller';
import { QnaRepository } from '@qna/repository/qna.repository';
import { QnaService } from '@qna/service/qna.service';

@Module({
  imports: [NotifierModule, JwtAuthModule],
  controllers: [QnaController],
  providers: [QnaService, QnaRepository],
  exports: [],
})
export class QnaModule {}
