import { BadRequestException, NotFoundException } from '@nestjs/common';

import { AdminRepository } from '@admin/repository/admin.repository';

import { NoticeStatus } from '@notice/constant/notice.constant';
import { CreateNoticeRequestDto } from '@notice/dto/request/createNotice.dto';
import { GetAdminNoticesRequestDto } from '@notice/dto/request/getAdminNotices.dto';
import { GetNoticesRequestDto } from '@notice/dto/request/getNotices.dto';
import { UpdateNoticeRequestDto } from '@notice/dto/request/updateNotice.dto';
import { Notice } from '@notice/entity/notice.entity';
import { NoticeRepository } from '@notice/repository/notice.repository';
import { NoticeService } from '@notice/service/notice.service';

import { NoticeFixture } from '@test/config/common/fixture/notice.fixture';

describe(`${NoticeService.name} Unit Test`, () => {
  let noticeService: NoticeService;
  let noticeRepository: Record<
    | 'findPublicList'
    | 'findPublicById'
    | 'findAdminList'
    | 'findOne'
    | 'create'
    | 'save'
    | 'delete',
    jest.Mock
  >;
  let adminRepository: Record<'findOneBy', jest.Mock>;

  const createNotice = (overwrites: Partial<Notice> = {}): Notice =>
    NoticeFixture.createNoticeFixture({
      id: 1,
      createdAt: new Date('2026-07-01T00:00:00.000Z'),
      updatedAt: new Date('2026-07-01T00:00:00.000Z'),
      ...overwrites,
    });

  beforeEach(() => {
    noticeRepository = {
      findPublicList: jest.fn(),
      findPublicById: jest.fn(),
      findAdminList: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((entityLike) => entityLike),
      save: jest.fn((entity) => entity),
      delete: jest.fn(),
    };
    adminRepository = {
      findOneBy: jest.fn(),
    };

    noticeService = new NoticeService(
      noticeRepository as unknown as NoticeRepository,
      adminRepository as unknown as AdminRepository,
    );
  });

  describe('getPublicNotices', () => {
    it('페이지네이션 값과 현재 시각을 리포지토리에 위임하고 목록을 반환한다.', async () => {
      // given
      const notices = [createNotice({ id: 2 }), createNotice({ id: 1 })];
      noticeRepository.findPublicList.mockResolvedValue({
        items: notices,
        totalCount: 25,
      });

      // when
      const result = await noticeService.getPublicNotices(
        new GetNoticesRequestDto({ page: 2, limit: 10 }),
      );

      // then
      expect(noticeRepository.findPublicList).toHaveBeenCalledWith(
        2,
        10,
        expect.any(Date),
      );
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalCount).toBe(25);
      expect(result.hasMore).toBe(true);
      expect(result.result).toHaveLength(2);
    });

    it('마지막 페이지일 경우 hasMore가 false로 반환된다.', async () => {
      // given
      noticeRepository.findPublicList.mockResolvedValue({
        items: [createNotice()],
        totalCount: 10,
      });

      // when
      const result = await noticeService.getPublicNotices(
        new GetNoticesRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.hasMore).toBe(false);
    });

    it('목록 응답에는 본문이 포함되지 않는다.', async () => {
      // given
      noticeRepository.findPublicList.mockResolvedValue({
        items: [createNotice()],
        totalCount: 1,
      });

      // when
      const result = await noticeService.getPublicNotices(
        new GetNoticesRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(result.result[0]).not.toHaveProperty('content');
    });
  });

  describe('getPublicNotice', () => {
    it('공개 조건을 만족하는 공지사항이 없을 경우 NotFoundException을 던진다.', async () => {
      // given
      noticeRepository.findPublicById.mockResolvedValue(null);

      // when & then
      await expect(noticeService.getPublicNotice(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('공개된 공지사항의 상세 정보를 작성자 이름과 함께 반환한다.', async () => {
      // given
      const notice = createNotice({ author: { name: '관리자' } as any });
      noticeRepository.findPublicById.mockResolvedValue(notice);

      // when
      const result = await noticeService.getPublicNotice(1);

      // then
      expect(noticeRepository.findPublicById).toHaveBeenCalledWith(
        1,
        expect.any(Date),
      );
      expect(result.id).toBe(notice.id);
      expect(result.content).toBe(notice.content);
      expect(result.authorName).toBe('관리자');
    });

    it('작성자가 없는 공지사항일 경우 작성자 이름을 null로 반환한다.', async () => {
      // given
      noticeRepository.findPublicById.mockResolvedValue(
        createNotice({ author: null }),
      );

      // when
      const result = await noticeService.getPublicNotice(1);

      // then
      expect(result.authorName).toBeNull();
    });
  });

  describe('getAdminNotices', () => {
    it('페이지네이션 값과 공개 상태 필터를 리포지토리에 위임한다.', async () => {
      // given
      noticeRepository.findAdminList.mockResolvedValue({
        items: [createNotice({ status: NoticeStatus.DRAFT })],
        totalCount: 1,
      });

      // when
      const result = await noticeService.getAdminNotices(
        new GetAdminNoticesRequestDto({
          page: 1,
          limit: 10,
          status: NoticeStatus.DRAFT,
        }),
      );

      // then
      expect(noticeRepository.findAdminList).toHaveBeenCalledWith(
        1,
        10,
        NoticeStatus.DRAFT,
      );
      expect(result.totalCount).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('공개 상태 필터가 없을 경우 undefined를 그대로 위임한다.', async () => {
      // given
      noticeRepository.findAdminList.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      // when
      await noticeService.getAdminNotices(
        new GetAdminNoticesRequestDto({ page: 1, limit: 10 }),
      );

      // then
      expect(noticeRepository.findAdminList).toHaveBeenCalledWith(
        1,
        10,
        undefined,
      );
    });
  });

  describe('getAdminNotice', () => {
    it('공지사항이 존재하지 않을 경우 NotFoundException을 던진다.', async () => {
      // given
      noticeRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(noticeService.getAdminNotice(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('임시저장 상태의 공지사항도 작성자와 함께 조회한다.', async () => {
      // given
      const notice = createNotice({
        status: NoticeStatus.DRAFT,
        author: { name: '관리자' } as any,
      });
      noticeRepository.findOne.mockResolvedValue(notice);

      // when
      const result = await noticeService.getAdminNotice(1);

      // then
      expect(noticeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(result.status).toBe(NoticeStatus.DRAFT);
      expect(result.authorName).toBe('관리자');
    });
  });

  describe('createNotice', () => {
    it('노출 시작일이 종료일과 같을 경우 BadRequestException을 던진다.', async () => {
      // given
      const dto = new CreateNoticeRequestDto({
        title: '제목',
        content: '<p>본문</p>',
        startAt: '2026-08-01T00:00:00.000Z',
        endAt: '2026-08-01T00:00:00.000Z',
      });

      // when & then
      await expect(noticeService.createNotice('admin@test.com', dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(noticeRepository.save).not.toHaveBeenCalled();
    });

    it('노출 시작일이 종료일보다 늦을 경우 BadRequestException을 던진다.', async () => {
      // given
      const dto = new CreateNoticeRequestDto({
        title: '제목',
        content: '<p>본문</p>',
        startAt: '2026-09-01T00:00:00.000Z',
        endAt: '2026-08-01T00:00:00.000Z',
      });

      // when & then
      await expect(noticeService.createNotice('admin@test.com', dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(noticeRepository.save).not.toHaveBeenCalled();
    });

    it('공개 상태와 상단 고정 여부가 없을 경우 임시저장 및 고정 해제 상태로 저장한다.', async () => {
      // given
      const author = { id: 1, name: '관리자', email: 'admin@test.com' };
      adminRepository.findOneBy.mockResolvedValue(author);
      const dto = new CreateNoticeRequestDto({
        title: '제목',
        content: '<p>본문</p>',
      });

      // when
      const result = await noticeService.createNotice('admin@test.com', dto);

      // then
      expect(adminRepository.findOneBy).toHaveBeenCalledWith({
        email: 'admin@test.com',
      });
      expect(noticeRepository.create).toHaveBeenCalledWith({
        title: '제목',
        content: '<p>본문</p>',
        status: NoticeStatus.DRAFT,
        isPinned: false,
        startAt: null,
        endAt: null,
        author,
      });
      expect(noticeRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(NoticeStatus.DRAFT);
      expect(result.isPinned).toBe(false);
      expect(result.authorName).toBe('관리자');
    });

    it('노출 기간과 공개 상태를 지정할 경우 지정한 값으로 저장한다.', async () => {
      // given
      adminRepository.findOneBy.mockResolvedValue(null);
      const dto = new CreateNoticeRequestDto({
        title: '제목',
        content: '<p>본문</p>',
        status: NoticeStatus.PUBLISHED,
        isPinned: true,
        startAt: '2026-08-01T00:00:00.000Z',
        endAt: '2026-08-31T00:00:00.000Z',
      });

      // when
      const result = await noticeService.createNotice('admin@test.com', dto);

      // then
      expect(noticeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NoticeStatus.PUBLISHED,
          isPinned: true,
          startAt: new Date('2026-08-01T00:00:00.000Z'),
          endAt: new Date('2026-08-31T00:00:00.000Z'),
          author: null,
        }),
      );
      expect(result.authorName).toBeNull();
    });
  });

  describe('updateNotice', () => {
    it('공지사항이 존재하지 않을 경우 NotFoundException을 던진다.', async () => {
      // given
      noticeRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        noticeService.updateNotice(1, new UpdateNoticeRequestDto({ title: '수정' })),
      ).rejects.toThrow(NotFoundException);
      expect(noticeRepository.save).not.toHaveBeenCalled();
    });

    it('기존 종료일보다 늦은 시작일만 수정할 경우 BadRequestException을 던진다.', async () => {
      // given
      noticeRepository.findOne.mockResolvedValue(
        createNotice({
          startAt: new Date('2026-07-01T00:00:00.000Z'),
          endAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
      );

      // when & then
      await expect(
        noticeService.updateNotice(
          1,
          new UpdateNoticeRequestDto({ startAt: '2026-09-01T00:00:00.000Z' }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(noticeRepository.save).not.toHaveBeenCalled();
    });

    it('전달하지 않은 항목은 기존 값을 유지한다.', async () => {
      // given
      const notice = createNotice({
        title: '기존 제목',
        content: '<p>기존 본문</p>',
        isPinned: true,
        status: NoticeStatus.PUBLISHED,
        startAt: new Date('2026-07-01T00:00:00.000Z'),
        endAt: new Date('2026-08-01T00:00:00.000Z'),
      });
      noticeRepository.findOne.mockResolvedValue(notice);

      // when
      const result = await noticeService.updateNotice(
        1,
        new UpdateNoticeRequestDto({ title: '수정된 제목' }),
      );

      // then
      expect(result.title).toBe('수정된 제목');
      expect(result.content).toBe('<p>기존 본문</p>');
      expect(result.isPinned).toBe(true);
      expect(result.status).toBe(NoticeStatus.PUBLISHED);
      expect(result.startAt).toEqual(new Date('2026-07-01T00:00:00.000Z'));
      expect(result.endAt).toEqual(new Date('2026-08-01T00:00:00.000Z'));
      expect(noticeRepository.save).toHaveBeenCalledWith(notice);
    });

    it('노출 기간을 null로 전달할 경우 노출 기간을 제거한다.', async () => {
      // given
      noticeRepository.findOne.mockResolvedValue(
        createNotice({
          startAt: new Date('2026-07-01T00:00:00.000Z'),
          endAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
      );

      // when
      const result = await noticeService.updateNotice(
        1,
        new UpdateNoticeRequestDto({ startAt: null, endAt: null }),
      );

      // then
      expect(result.startAt).toBeNull();
      expect(result.endAt).toBeNull();
    });

    it('공개 상태와 상단 고정 여부를 수정할 경우 변경된 값으로 저장한다.', async () => {
      // given
      noticeRepository.findOne.mockResolvedValue(
        createNotice({ status: NoticeStatus.DRAFT, isPinned: false }),
      );

      // when
      const result = await noticeService.updateNotice(
        1,
        new UpdateNoticeRequestDto({
          status: NoticeStatus.PUBLISHED,
          isPinned: true,
        }),
      );

      // then
      expect(result.status).toBe(NoticeStatus.PUBLISHED);
      expect(result.isPinned).toBe(true);
      expect(noticeRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteNotice', () => {
    it('삭제된 행이 없을 경우 NotFoundException을 던진다.', async () => {
      // given
      noticeRepository.delete.mockResolvedValue({ affected: 0 });

      // when & then
      await expect(noticeService.deleteNotice(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('공지사항 삭제에 성공한다.', async () => {
      // given
      noticeRepository.delete.mockResolvedValue({ affected: 1 });

      // when
      await noticeService.deleteNotice(1);

      // then
      expect(noticeRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
