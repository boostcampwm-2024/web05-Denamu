import { Injectable, NotFoundException } from '@nestjs/common';

import { BoardCategory, BoardStatus } from '@board/constant/board.constant';
import { CreateBoardRequestDto } from '@board/dto/request/createBoard.dto';
import { GetAdminBoardsRequestDto } from '@board/dto/request/getAdminBoards.dto';
import { GetBoardsRequestDto } from '@board/dto/request/getBoards.dto';
import { UpdateBoardRequestDto } from '@board/dto/request/updateBoard.dto';
import {
  BoardDetailDto,
  BoardListResponseDto,
} from '@board/dto/response/board.dto';
import { Board } from '@board/entity/board.entity';
import { BoardRepository } from '@board/repository/board.repository';
import { validateWindow } from '@board/util/validateWindow';

import { AdminRepository } from '@admin/repository/admin.repository';

import { EmailProducer } from '@common/email/email.producer';
import { WinstonLoggerService } from '@common/logger/logger.service';

import { UserRepository } from '@user/repository/user.repository';

const NOT_FOUND_MESSAGE = '존재하지 않는 게시글입니다.';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly adminRepository: AdminRepository,
    private readonly userRepository: UserRepository,
    private readonly emailProducer: EmailProducer,
    private readonly logger: WinstonLoggerService,
  ) {}

  async getPublicBoards(queryDto: GetBoardsRequestDto) {
    const { page, limit, category } = queryDto;
    const { items, totalCount } = await this.boardRepository.findPublicList(
      page,
      limit,
      new Date(),
      category,
    );
    return BoardListResponseDto.toResponseDto(items, page, limit, totalCount);
  }

  async getPublicBoard(id: number): Promise<BoardDetailDto> {
    const board = await this.boardRepository.findPublicById(id, new Date());
    if (!board) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
    return BoardDetailDto.toResponseDto(board);
  }

  async getAdminBoards(queryDto: GetAdminBoardsRequestDto) {
    const { page, limit, status, category } = queryDto;
    const { items, totalCount } = await this.boardRepository.findAdminList(
      page,
      limit,
      status,
      category,
    );
    return BoardListResponseDto.toResponseDto(items, page, limit, totalCount);
  }

  async getAdminBoard(id: number): Promise<BoardDetailDto> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!board) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
    return BoardDetailDto.toResponseDto(board);
  }

  async createBoard(
    authorEmail: string,
    dto: CreateBoardRequestDto,
  ): Promise<BoardDetailDto> {
    const startAt = dto.startAt ? new Date(dto.startAt) : null;
    const endAt = dto.endAt ? new Date(dto.endAt) : null;
    validateWindow(startAt, endAt);

    const author = await this.adminRepository.findOneBy({ email: authorEmail });

    const board = this.boardRepository.create({
      title: dto.title,
      content: dto.content,
      status: dto.status ?? BoardStatus.DRAFT,
      category: dto.category ?? BoardCategory.NOTICE,
      isPinned: dto.isPinned ?? false,
      startAt,
      endAt,
      author,
    });
    await this.boardRepository.save(board);

    if (this.isNoticeVisibleNow(board)) {
      await this.notifyNoticePublished(board);
    }

    return BoardDetailDto.toResponseDto(board);
  }

  private isNoticeVisibleNow(board: Board): boolean {
    const now = new Date();
    return (
      board.category === BoardCategory.NOTICE &&
      board.status === BoardStatus.PUBLISHED &&
      (!board.startAt || board.startAt <= now) &&
      (!board.endAt || board.endAt >= now)
    );
  }

  private async notifyNoticePublished(board: Board): Promise<void> {
    try {
      const recipients = await this.userRepository.findNoticeAgreedUsers();
      const results = await Promise.allSettled(
        recipients.map((recipient) =>
          this.emailProducer.produceNoticePublished({
            email: recipient.email,
            userName: recipient.userName,
            boardId: board.id,
            title: board.title,
          }),
        ),
      );

      const failedCount = results.filter(
        (result) => result.status === 'rejected',
      ).length;
      if (failedCount > 0) {
        this.logger.error(
          `공지사항 이메일 발행 중 일부가 실패했습니다.: boardId=${board.id}, failed=${failedCount}/${recipients.length}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `공지사항 이메일 발행에 실패했습니다.: boardId=${board.id}, error=${error}`,
      );
    }
  }

  async updateBoard(
    id: number,
    dto: UpdateBoardRequestDto,
  ): Promise<BoardDetailDto> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!board) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    const startAt =
      dto.startAt !== undefined
        ? dto.startAt
          ? new Date(dto.startAt)
          : null
        : board.startAt;
    const endAt =
      dto.endAt !== undefined
        ? dto.endAt
          ? new Date(dto.endAt)
          : null
        : board.endAt;
    validateWindow(startAt, endAt);

    if (dto.title !== undefined) board.title = dto.title;
    if (dto.content !== undefined) board.content = dto.content;
    if (dto.isPinned !== undefined) board.isPinned = dto.isPinned;
    if (dto.status !== undefined) board.status = dto.status;
    if (dto.category !== undefined) board.category = dto.category;
    board.startAt = startAt;
    board.endAt = endAt;

    await this.boardRepository.save(board);
    return BoardDetailDto.toResponseDto(board);
  }

  async deleteBoard(id: number): Promise<void> {
    const result = await this.boardRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
  }
}
