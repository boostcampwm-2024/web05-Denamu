import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';

import { DataSource } from 'typeorm';

import { AdminRepository } from '@admin/repository/admin.repository';

import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';
import { NotifierRegistry } from '@common/notification/notifier-registry';

import { FeedRepository } from '@feed/repository/feed.repository';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';
import { ReportService } from '@report/service/report.service';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { SuspensionService } from '@suspension/service/suspension.service';

import { UserService } from '@user/service/user.service';

describe(`${ReportService.name} Unit Test`, () => {
  let reportService: ReportService;
  let reportRepository: jest.Mocked<
    Pick<ReportRepository, 'insert' | 'getReports' | 'findOne' | 'delete'>
  >;
  let rssAcceptRepository: jest.Mocked<Pick<RssAcceptRepository, 'findOne'>>;
  let commentRepository: jest.Mocked<Pick<CommentRepository, 'findOne'>>;
  let feedRepository: jest.Mocked<Pick<FeedRepository, 'findOne'>>;
  let userService: jest.Mocked<Pick<UserService, 'getUser'>>;
  let adminRepository: jest.Mocked<Pick<AdminRepository, 'findOneBy'>>;
  let suspensionService: jest.Mocked<Pick<SuspensionService, 'suspendUser'>>;
  let dataSource: { transaction: jest.Mock };
  let notifierRegistry: jest.Mocked<Pick<NotifierRegistry, 'sendAlert'>>;
  let eventEmitter: jest.Mocked<Pick<EventEmitter2, 'emit'>>;
  let manager: {
    delete: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
    decrement: jest.Mock;
    increment: jest.Mock;
    findOne: jest.Mock;
  };

  const user: Payload = {
    id: 1,
    email: 'user@test.com',
    userName: 'tester',
    role: 'user',
  };
  const reportDto = { reason: ReportReason.SPAM, detail: '광고성 내용입니다.' };

  beforeEach(() => {
    reportRepository = {
      insert: jest.fn(),
      getReports: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    rssAcceptRepository = { findOne: jest.fn() };
    commentRepository = { findOne: jest.fn() };
    feedRepository = { findOne: jest.fn() };
    userService = { getUser: jest.fn() };
    adminRepository = { findOneBy: jest.fn() };
    suspensionService = { suspendUser: jest.fn() };
    manager = {
      delete: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
      decrement: jest.fn(),
      increment: jest.fn(),
      findOne: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn((callback: (manager: unknown) => Promise<unknown>) =>
        callback(manager),
      ),
    };
    notifierRegistry = { sendAlert: jest.fn() };
    eventEmitter = { emit: jest.fn() };

    reportService = new ReportService(
      reportRepository as unknown as ReportRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
      commentRepository as unknown as CommentRepository,
      feedRepository as unknown as FeedRepository,
      userService as unknown as UserService,
      adminRepository as unknown as AdminRepository,
      suspensionService as unknown as SuspensionService,
      dataSource as unknown as DataSource,
      eventEmitter as unknown as EventEmitter2,
      notifierRegistry as unknown as NotifierRegistry,
    );
  });

  describe('reportUser', () => {
    it('자기 자신을 신고하면 BadRequestException을 던진다.', async () => {
      // when & then
      await expect(
        reportService.reportUser(user, user.id, reportDto),
      ).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('신고 대상 유저가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(
        new NotFoundException('존재하지 않는 유저입니다.'),
      );

      // when & then
      await expect(
        reportService.reportUser(user, 2, reportDto),
      ).rejects.toThrow(NotFoundException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('이미 신고한 유저면 ConflictException을 던진다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      reportRepository.insert.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // when & then
      await expect(
        reportService.reportUser(user, 2, reportDto),
      ).rejects.toThrow(ConflictException);
    });

    it('사용자 신고 등록에 성공한다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      reportRepository.insert.mockResolvedValue(undefined);

      // when
      await reportService.reportUser(user, 2, reportDto);

      // then
      expect(reportRepository.insert).toHaveBeenCalledWith({
        reporter: { id: user.id },
        targetType: ReportTargetType.USER,
        targetId: 2,
        reportedUser: { id: 2 },
        reason: reportDto.reason,
        detail: reportDto.detail,
      });
    });
  });

  describe('reportRss', () => {
    it('신고 대상 RSS가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(reportService.reportRss(user, 5, reportDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('본인 소유의 RSS를 신고하면 BadRequestException을 던진다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 5,
        userId: user.id,
      } as any);

      // when & then
      await expect(reportService.reportRss(user, 5, reportDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('RSS 신고 등록에 성공한다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({
        id: 5,
        userId: 99,
      } as any);
      reportRepository.insert.mockResolvedValue(undefined);

      // when
      await reportService.reportRss(user, 5, reportDto);

      // then
      expect(reportRepository.insert).toHaveBeenCalledWith({
        reporter: { id: user.id },
        targetType: ReportTargetType.RSS,
        targetId: 5,
        reportedRss: { id: 5 },
        reason: reportDto.reason,
        detail: reportDto.detail,
      });
    });
  });

  describe('reportComment', () => {
    it('신고 대상 댓글이 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        reportService.reportComment(user, 10, reportDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('자신의 댓글을 신고하면 BadRequestException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 10,
        user: { id: user.id },
      } as any);

      // when & then
      await expect(
        reportService.reportComment(user, 10, reportDto),
      ).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('댓글 신고 등록에 성공한다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({
        id: 10,
        user: { id: 99 },
      } as any);
      reportRepository.insert.mockResolvedValue(undefined);

      // when
      await reportService.reportComment(user, 10, reportDto);

      // then
      expect(reportRepository.insert).toHaveBeenCalledWith({
        reporter: { id: user.id },
        targetType: ReportTargetType.COMMENT,
        targetId: 10,
        reportedComment: { id: 10 },
        reason: reportDto.reason,
        detail: reportDto.detail,
      });
    });
  });

  describe('reportFeed', () => {
    it('신고 대상 게시글이 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      feedRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        reportService.reportFeed(user, 20, reportDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('자신의 게시글을 신고하면 BadRequestException을 던진다.', async () => {
      // given
      feedRepository.findOne.mockResolvedValue({
        id: 20,
        blog: { userId: user.id },
      } as any);

      // when & then
      await expect(
        reportService.reportFeed(user, 20, reportDto),
      ).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('게시글 신고 등록에 성공한다.', async () => {
      // given
      feedRepository.findOne.mockResolvedValue({
        id: 20,
        blog: { userId: 99 },
      } as any);
      reportRepository.insert.mockResolvedValue(undefined);

      // when
      await reportService.reportFeed(user, 20, reportDto);

      // then
      expect(reportRepository.insert).toHaveBeenCalledWith({
        reporter: { id: user.id },
        targetType: ReportTargetType.FEED,
        targetId: 20,
        reportedFeed: { id: 20 },
        reason: reportDto.reason,
        detail: reportDto.detail,
      });
    });
  });

  describe('approveReport', () => {
    const approveDto = { detail: '반복 신고로 인한 정지' };

    it('존재하지 않는 신고면 NotFoundException을 던진다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue(null);

      // when & then
      await expect(
        reportService.approveReport(1, 'admin@test.com', approveDto),
      ).rejects.toThrow(NotFoundException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('정지 종료 일시가 과거면 BadRequestException을 던진다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.USER,
        reportedUser: { id: 2 },
      } as any);

      // when & then
      await expect(
        reportService.approveReport(1, 'admin@test.com', {
          ...approveDto,
          suspendedUntil: new Date(Date.now() - 1000).toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('이미 처리된 신고면 ConflictException을 던진다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.USER,
        reportedUser: { id: 2 },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 0 });

      // when & then
      await expect(
        reportService.approveReport(1, 'admin@test.com', approveDto),
      ).rejects.toThrow(ConflictException);
      expect(suspensionService.suspendUser).not.toHaveBeenCalled();
    });

    it('COMMENT 신고 승인 시 유저 정지를 생성하고 신고를 삭제한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.COMMENT,
        reportedComment: {
          id: 5,
          user: { id: 2 },
          feed: { id: 100 },
          parentId: null,
          parent: null,
        },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });
      manager.count.mockResolvedValue(0);

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), {
        id: 1,
      });
      expect(suspensionService.suspendUser).toHaveBeenCalledWith(manager, {
        userId: 2,
        adminId: 9,
        detail: approveDto.detail,
        suspendedUntil: null,
      });
    });

    it('답글이 없는 최상위 댓글 신고를 승인하면 댓글을 hard delete하고 피드 댓글 수를 감소시킨다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.COMMENT,
        reportedComment: {
          id: 5,
          user: { id: 2 },
          feed: { id: 100 },
          parentId: null,
          parent: null,
        },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });
      manager.count.mockResolvedValue(0);

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.count).toHaveBeenCalledWith(expect.anything(), {
        where: { parentId: 5 },
      });
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), {
        id: 5,
      });
      expect(manager.decrement).toHaveBeenCalledWith(
        expect.anything(),
        { id: 100 },
        'commentCount',
        1,
      );
      expect(manager.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'comment.deleted',
        expect.objectContaining({ feedId: 100, parentAuthorId: null }),
      );
    });

    it('답글이 있는 최상위 댓글 신고를 승인하면 댓글을 soft delete한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.COMMENT,
        reportedComment: {
          id: 5,
          user: { id: 2 },
          feed: { id: 100 },
          parentId: null,
          parent: null,
        },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });
      manager.count.mockResolvedValue(2);

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.update).toHaveBeenCalledWith(
        expect.anything(),
        { id: 5 },
        { isDeleted: true, isAdminDeleted: true },
      );
      expect(manager.decrement).not.toHaveBeenCalled();
    });

    it('답글 댓글 신고를 승인하면 답글 여부를 조회하지 않고 hard delete한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.COMMENT,
        reportedComment: {
          id: 5,
          user: { id: 2 },
          feed: { id: 100 },
          parentId: 1,
          parent: { user: { id: 3 } },
        },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.count).not.toHaveBeenCalled();
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), {
        id: 5,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'comment.deleted',
        expect.objectContaining({ feedId: 100, parentAuthorId: 3 }),
      );
    });

    it('RSS 신고를 승인하면 RSS를 삭제하고 소유자를 정지한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.RSS,
        reportedRss: { id: 7, userId: 4 },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), {
        id: 7,
      });
      expect(suspensionService.suspendUser).toHaveBeenCalledWith(manager, {
        userId: 4,
        adminId: 9,
        detail: approveDto.detail,
        suspendedUntil: null,
      });
    });

    it('소유자가 없는 RSS 신고를 승인하면 RSS만 삭제하고 정지는 생략한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.RSS,
        reportedRss: { id: 7, userId: null },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), {
        id: 7,
      });
      expect(suspensionService.suspendUser).not.toHaveBeenCalled();
    });

    it('게시글 신고를 승인하면 게시글을 비공개 처리하고 RSS 소유자를 정지한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.FEED,
        reportedFeed: { id: 30, blog: { id: 7, userId: 4 } },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });
      manager.findOne.mockResolvedValue({ id: 7, suspensionCount: 1 });

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.update).toHaveBeenCalledWith(
        expect.anything(),
        { id: 30 },
        { isPublic: false },
      );
      expect(manager.increment).toHaveBeenCalledWith(
        expect.anything(),
        { id: 7 },
        'suspensionCount',
        1,
      );
      expect(suspensionService.suspendUser).toHaveBeenCalledWith(manager, {
        userId: 4,
        adminId: 9,
        detail: approveDto.detail,
        suspendedUntil: null,
      });
      expect(manager.delete).not.toHaveBeenCalledWith(expect.anything(), {
        id: 7,
      });
    });

    it('게시글 정지 누적 횟수가 3회 이상이면 RSS를 삭제한다.', async () => {
      // given
      reportRepository.findOne.mockResolvedValue({
        id: 1,
        targetType: ReportTargetType.FEED,
        reportedFeed: { id: 30, blog: { id: 7, userId: 4 } },
      } as any);
      adminRepository.findOneBy.mockResolvedValue({ id: 9 } as any);
      manager.delete.mockResolvedValue({ affected: 1 });
      manager.findOne.mockResolvedValue({ id: 7, suspensionCount: 3 });

      // when
      await reportService.approveReport(1, 'admin@test.com', approveDto);

      // then
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), {
        id: 7,
      });
    });
  });

  describe('rejectReport', () => {
    it('존재하지 않는 신고면 NotFoundException을 던진다.', async () => {
      // given
      reportRepository.delete.mockResolvedValue({ affected: 0 } as any);

      // when & then
      await expect(reportService.rejectReport(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('신고 삭제에 성공한다.', async () => {
      // given
      reportRepository.delete.mockResolvedValue({ affected: 1 } as any);

      // when
      await reportService.rejectReport(1);

      // then
      expect(reportRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
