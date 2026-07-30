import { BadRequestException, Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { Payload } from '@common/guard/jwt.guard';
import { NotifierRegistry } from '@common/notification/notifier-registry';

import { QnaMessageType, QnaStatus } from '@qna/constant/qna.constant';
import { CreateQnaRequestDto } from '@qna/dto/request/createQna.dto';
import { QnaCreatedDto } from '@qna/dto/response/qna.dto';
import { Qna } from '@qna/entity/qna.entity';
import { QnaMessage } from '@qna/entity/qnaMessage.entity';

import { SALT_ROUNDS } from '@user/constant/user.constants';

@Injectable()
export class QnaService {
  constructor(
    private readonly notifierRegistry: NotifierRegistry,
    private readonly dataSource: DataSource,
  ) {}

  private notifyNewQna(
    qna: { id: number; isSecret: boolean; content: string },
    isFollowUp: boolean,
  ) {
    void this.notifierRegistry.sendAlert(
      `📮 새로운 Q&A 문의가 등록되었습니다.\n문의 번호: #${qna.id}${
        isFollowUp ? '\n(후속 질문)' : ''
      }\n문의 내용: ${qna.content}\n`,
    );
  }

  private validateCreateInput(user: Payload | null, dto: CreateQnaRequestDto) {
    if (user) {
      if (dto.isSecret && !dto.password) {
        throw new BadRequestException('비공개 문의는 비밀번호가 필요합니다.');
      }
      return;
    }

    if (!dto.password || !dto.guestName || !dto.guestEmail) {
      throw new BadRequestException(
        '비회원은 이름, 이메일, 비밀번호를 모두 입력해야 합니다.',
      );
    }
  }

  async createQna(user: Payload | null, dto: CreateQnaRequestDto) {
    this.validateCreateInput(user, dto);

    const shouldHashPassword = user ? dto.isSecret : true;
    const hashedPassword =
      shouldHashPassword && dto.password
        ? await bcrypt.hash(dto.password, SALT_ROUNDS)
        : null;

    let qnaId: number;
    await this.dataSource.transaction(async (manager) => {
      const qna = manager.create(Qna, {
        title: dto.title,
        isSecret: dto.isSecret,
        password: hashedPassword,
        guestName: user ? null : dto.guestName,
        guestEmail: user ? null : dto.guestEmail,
        userId: user ? user.id : null,
        status: QnaStatus.PENDING,
      });
      await manager.save(qna);
      await manager.save(
        manager.create(QnaMessage, {
          qna,
          type: QnaMessageType.QUESTION,
          content: dto.content,
        }),
      );
      qnaId = qna.id;
    });

    this.notifyNewQna(
      { id: qnaId, isSecret: dto.isSecret, content: dto.content },
      false,
    );
    return QnaCreatedDto.of(qnaId);
  }
}
