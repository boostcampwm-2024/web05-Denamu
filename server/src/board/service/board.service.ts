import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BoardStatus } from '@board/constant/board.constant';
import { CreateBoardRequestDto } from '@board/dto/request/createBoard.dto';
import { GetAdminBoardsRequestDto } from '@board/dto/request/getAdminBoards.dto';
import { GetBoardsRequestDto } from '@board/dto/request/getBoards.dto';
import { UpdateBoardRequestDto } from '@board/dto/request/updateBoard.dto';
import {
  BoardDetailDto,
  BoardListResponseDto,
} from '@board/dto/response/board.dto';
import { BoardRepository } from '@board/repository/board.repository';

import { AdminRepository } from '@admin/repository/admin.repository';

const NOT_FOUND_MESSAGE = '존재하지 않는 게시글입니다.';

@Injectable()
export class BoardService {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  private validateWindow(startAt: Date | null, endAt: Date | null) {
    if (startAt && endAt && startAt.getTime() >= endAt.getTime()) {
      throw new BadRequestException(
        '노출 시작일은 종료일보다 이전이어야 합니다.',
      );
    }
  }

  async getPublicBoards(queryDto: GetBoardsRequestDto) {
    const { page, limit } = queryDto;
    const { items, totalCount } = await this.boardRepository.findPublicList(
      page,
      limit,
      new Date(),
    );
    return BoardListResponseDto.of(items, page, limit, totalCount);
  }

  async getPublicBoard(id: number): Promise<BoardDetailDto> {
    const board = await this.boardRepository.findPublicById(id, new Date());
    if (!board) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
    return BoardDetailDto.fromDetail(board);
  }

  async getAdminBoards(queryDto: GetAdminBoardsRequestDto) {
    const { page, limit, status } = queryDto;
    const { items, totalCount } = await this.boardRepository.findAdminList(
      page,
      limit,
      status,
    );
    return BoardListResponseDto.of(items, page, limit, totalCount);
  }

  async getAdminBoard(id: number): Promise<BoardDetailDto> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!board) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
    return BoardDetailDto.fromDetail(board);
  }

  async createBoard(
    authorEmail: string,
    dto: CreateBoardRequestDto,
  ): Promise<BoardDetailDto> {
    const startAt = dto.startAt ? new Date(dto.startAt) : null;
    const endAt = dto.endAt ? new Date(dto.endAt) : null;
    this.validateWindow(startAt, endAt);

    const author = await this.adminRepository.findOneBy({ email: authorEmail });

    const board = this.boardRepository.create({
      title: dto.title,
      content: dto.content,
      status: dto.status ?? BoardStatus.DRAFT,
      isPinned: dto.isPinned ?? false,
      startAt,
      endAt,
      author,
    });
    await this.boardRepository.save(board);
    return BoardDetailDto.fromDetail(board);
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
    this.validateWindow(startAt, endAt);

    if (dto.title !== undefined) board.title = dto.title;
    if (dto.content !== undefined) board.content = dto.content;
    if (dto.isPinned !== undefined) board.isPinned = dto.isPinned;
    if (dto.status !== undefined) board.status = dto.status;
    board.startAt = startAt;
    board.endAt = endAt;

    await this.boardRepository.save(board);
    return BoardDetailDto.fromDetail(board);
  }

  async deleteBoard(id: number): Promise<void> {
    const result = await this.boardRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
  }
}
