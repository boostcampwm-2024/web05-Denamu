import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { Payload } from '@common/guard/jwt.guard';
import { NotifierRegistry } from '@common/notification/notifier-registry';

import {
  QNA_NOT_FOUND_MESSAGE,
  QNA_VERIFY_FAIL_MESSAGE,
  QnaMessageType,
  QnaStatus,
} from '@qna/constant/qna.constant';
import { CreateQnaRequestDto } from '@qna/dto/request/createQna.dto';
import { CreateQnaMessageRequestDto } from '@qna/dto/request/createQnaMessage.dto';
import { GetAdminQnasRequestDto } from '@qna/dto/request/getAdminQnas.dto';
import { GetQnasRequestDto } from '@qna/dto/request/getQnas.dto';
import {
  QnaCreatedDto,
  QnaDetailDto,
  QnaListResponseDto,
  QnaLockedDto,
} from '@qna/dto/response/qna.dto';
import { Qna } from '@qna/entity/qna.entity';
import { QnaMessage } from '@qna/entity/qnaMessage.entity';
import { QnaRepository } from '@qna/repository/qna.repository';

import { SALT_ROUNDS } from '@user/constant/user.constants';

@Injectable()
export class QnaService {
  constructor(
    private readonly qnaRepository: QnaRepository,
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

  async getPublicQnas(queryDto: GetQnasRequestDto) {
    const { page, limit } = queryDto;
    const { items, totalCount } = await this.qnaRepository.findPublicList(
      page,
      limit,
    );
    return QnaListResponseDto.of(items, page, limit, totalCount);
  }

  async getPublicQna(id: number) {
    const qna = await this.qnaRepository.findByIdWithMessages(id);
    if (!qna) {
      throw new NotFoundException(QNA_NOT_FOUND_MESSAGE);
    }

    if (qna.isSecret) {
      return QnaLockedDto.of(qna);
    }
    return QnaDetailDto.fromDetail(qna);
  }

  async verifyQna(id: number, password: string) {
    const qna = await this.qnaRepository.findByIdWithMessages(id);
    if (
      !qna ||
      !qna.password ||
      !(await bcrypt.compare(password, qna.password))
    ) {
      throw new UnauthorizedException(QNA_VERIFY_FAIL_MESSAGE);
    }

    return QnaDetailDto.fromDetail(qna);
  }

  async createQnaMessage(
    user: Payload | null,
    id: number,
    dto: CreateQnaMessageRequestDto,
  ) {
    let notifyPayload: { id: number; isSecret: boolean; content: string };

    await this.dataSource.transaction(async (manager) => {
      const qna = await manager.findOne(Qna, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!qna) {
        throw new NotFoundException(QNA_NOT_FOUND_MESSAGE);
      }
      if (qna.status !== QnaStatus.ANSWERED) {
        throw new BadRequestException(
          '답변 완료 후에만 추가 질문이 가능합니다.',
        );
      }

      if (qna.userId) {
        if (!user || user.id !== qna.userId) {
          throw new ForbiddenException(
            '작성자만 추가 질문을 등록할 수 있습니다.',
          );
        }
      } else {
        if (
          !dto.password ||
          !qna.password ||
          !(await bcrypt.compare(dto.password, qna.password))
        ) {
          throw new UnauthorizedException(QNA_VERIFY_FAIL_MESSAGE);
        }
      }

      await manager.save(
        manager.create(QnaMessage, {
          qna,
          type: QnaMessageType.QUESTION,
          content: dto.content,
        }),
      );
      qna.status = QnaStatus.PENDING;
      await manager.save(qna);

      notifyPayload = {
        id: qna.id,
        isSecret: qna.isSecret,
        content: dto.content,
      };
    });

    this.notifyNewQna(notifyPayload, true);
  }

  async getAdminQnas(queryDto: GetAdminQnasRequestDto) {
    const { page, limit, status } = queryDto;
    const { items, totalCount } = await this.qnaRepository.findAdminList(
      page,
      limit,
      status,
    );
    return QnaListResponseDto.of(items, page, limit, totalCount);
  }

  async getAdminQna(id: number) {
    const qna = await this.qnaRepository.findByIdWithMessages(id);
    if (!qna) {
      throw new NotFoundException(QNA_NOT_FOUND_MESSAGE);
    }
    return QnaDetailDto.fromDetail(qna);
  }
}
