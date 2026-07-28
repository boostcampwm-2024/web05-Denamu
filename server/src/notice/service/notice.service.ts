import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { CreateNoticeRequestDto } from '@notice/dto/request/createNotice.dto';
import { GetAdminNoticesRequestDto } from '@notice/dto/request/getAdminNotices.dto';
import { GetNoticesRequestDto } from '@notice/dto/request/getNotices.dto';
import { UpdateNoticeRequestDto } from '@notice/dto/request/updateNotice.dto';
import {
  NoticeDetailDto,
  NoticeListResponseDto,
} from '@notice/dto/response/notice.dto';
import { NoticeRepository } from '@notice/repository/notice.repository';

import { AdminRepository } from '@admin/repository/admin.repository';

const NOT_FOUND_MESSAGE = '존재하지 않는 공지사항입니다.';

@Injectable()
export class NoticeService {
  constructor(
    private readonly noticeRepository: NoticeRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  private validateWindow(startAt: Date | null, endAt: Date | null) {
    if (startAt && endAt && startAt.getTime() >= endAt.getTime()) {
      throw new BadRequestException(
        '노출 시작일은 종료일보다 이전이어야 합니다.',
      );
    }
  }

  async getPublicNotices(queryDto: GetNoticesRequestDto) {
    const { page, limit } = queryDto;
    const { items, totalCount } = await this.noticeRepository.findPublicList(
      page,
      limit,
      new Date(),
    );
    return NoticeListResponseDto.of(items, page, limit, totalCount);
  }

  async getPublicNotice(id: number): Promise<NoticeDetailDto> {
    const notice = await this.noticeRepository.findPublicById(id, new Date());
    if (!notice) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
    return NoticeDetailDto.fromDetail(notice);
  }

  async getAdminNotices(queryDto: GetAdminNoticesRequestDto) {
    const { page, limit, status } = queryDto;
    const { items, totalCount } = await this.noticeRepository.findAdminList(
      page,
      limit,
      status,
    );
    return NoticeListResponseDto.of(items, page, limit, totalCount);
  }

  async getAdminNotice(id: number): Promise<NoticeDetailDto> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!notice) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
    return NoticeDetailDto.fromDetail(notice);
  }

  async createNotice(
    authorEmail: string,
    dto: CreateNoticeRequestDto,
  ): Promise<NoticeDetailDto> {
    const startAt = dto.startAt ? new Date(dto.startAt) : null;
    const endAt = dto.endAt ? new Date(dto.endAt) : null;
    this.validateWindow(startAt, endAt);

    const author = await this.adminRepository.findOneBy({ email: authorEmail });

    const notice = this.noticeRepository.create({
      title: dto.title,
      content: dto.content,
      status: dto.status ?? NoticeStatus.DRAFT,
      isPinned: dto.isPinned ?? false,
      startAt,
      endAt,
      author,
    });
    await this.noticeRepository.save(notice);
    return NoticeDetailDto.fromDetail(notice);
  }

  async updateNotice(
    id: number,
    dto: UpdateNoticeRequestDto,
  ): Promise<NoticeDetailDto> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!notice) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    const startAt =
      dto.startAt !== undefined
        ? dto.startAt
          ? new Date(dto.startAt)
          : null
        : notice.startAt;
    const endAt =
      dto.endAt !== undefined
        ? dto.endAt
          ? new Date(dto.endAt)
          : null
        : notice.endAt;
    this.validateWindow(startAt, endAt);

    if (dto.title !== undefined) notice.title = dto.title;
    if (dto.content !== undefined) notice.content = dto.content;
    if (dto.isPinned !== undefined) notice.isPinned = dto.isPinned;
    if (dto.status !== undefined) notice.status = dto.status;
    notice.startAt = startAt;
    notice.endAt = endAt;

    await this.noticeRepository.save(notice);
    return NoticeDetailDto.fromDetail(notice);
  }

  async deleteNotice(id: number): Promise<void> {
    const result = await this.noticeRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
  }
}
