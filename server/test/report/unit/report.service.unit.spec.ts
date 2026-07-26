import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';

import { FeedRepository } from '@feed/repository/feed.repository';

import { ReportReason, ReportTargetType } from '@report/constant/report.constant';
import { ReportRepository } from '@report/repository/report.repository';
import { ReportService } from '@report/service/report.service';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { UserService } from '@user/service/user.service';

describe(`${ReportService.name} Unit Test`, () => {
  let reportService: ReportService;
  let reportRepository: jest.Mocked<Pick<ReportRepository, 'insert' | 'getReports'>>;
  let rssAcceptRepository: jest.Mocked<Pick<RssAcceptRepository, 'findOne'>>;
  let commentRepository: jest.Mocked<Pick<CommentRepository, 'findOne'>>;
  let feedRepository: jest.Mocked<Pick<FeedRepository, 'findOne'>>;
  let userService: jest.Mocked<Pick<UserService, 'getUser'>>;

  const user: Payload = { id: 1, email: 'user@test.com', userName: 'tester', role: 'user' };
  const reportDto = { reason: ReportReason.SPAM, detail: '광고성 내용입니다.' };

  beforeEach(() => {
    reportRepository = {
      insert: jest.fn(),
      getReports: jest.fn(),
    };
    rssAcceptRepository = { findOne: jest.fn() };
    commentRepository = { findOne: jest.fn() };
    feedRepository = { findOne: jest.fn() };
    userService = { getUser: jest.fn() };

    reportService = new ReportService(
      reportRepository as unknown as ReportRepository,
      rssAcceptRepository as unknown as RssAcceptRepository,
      commentRepository as unknown as CommentRepository,
      feedRepository as unknown as FeedRepository,
      userService as unknown as UserService,
    );
  });

  describe('reportUser', () => {
    it('자기 자신을 신고하면 BadRequestException을 던진다.', async () => {
      // when & then
      await expect(reportService.reportUser(user, user.id, reportDto)).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('신고 대상 유저가 존재하지 않으면 NotFoundException을 던진다.', async () => {
      // given
      userService.getUser.mockRejectedValue(new NotFoundException('존재하지 않는 유저입니다.'));

      // when & then
      await expect(reportService.reportUser(user, 2, reportDto)).rejects.toThrow(NotFoundException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('이미 신고한 유저면 ConflictException을 던진다.', async () => {
      // given
      userService.getUser.mockResolvedValue({ id: 2 } as any);
      reportRepository.insert.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      // when & then
      await expect(reportService.reportUser(user, 2, reportDto)).rejects.toThrow(ConflictException);
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
      await expect(reportService.reportRss(user, 5, reportDto)).rejects.toThrow(NotFoundException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('본인 소유의 RSS를 신고하면 BadRequestException을 던진다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({ id: 5, userId: user.id } as any);

      // when & then
      await expect(reportService.reportRss(user, 5, reportDto)).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('RSS 신고 등록에 성공한다.', async () => {
      // given
      rssAcceptRepository.findOne.mockResolvedValue({ id: 5, userId: 99 } as any);
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
      await expect(reportService.reportComment(user, 10, reportDto)).rejects.toThrow(NotFoundException);
    });

    it('자신의 댓글을 신고하면 BadRequestException을 던진다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({ id: 10, user: { id: user.id } } as any);

      // when & then
      await expect(reportService.reportComment(user, 10, reportDto)).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('댓글 신고 등록에 성공한다.', async () => {
      // given
      commentRepository.findOne.mockResolvedValue({ id: 10, user: { id: 99 } } as any);
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
      await expect(reportService.reportFeed(user, 20, reportDto)).rejects.toThrow(NotFoundException);
    });

    it('자신의 게시글을 신고하면 BadRequestException을 던진다.', async () => {
      // given
      feedRepository.findOne.mockResolvedValue({ id: 20, blog: { userId: user.id } } as any);

      // when & then
      await expect(reportService.reportFeed(user, 20, reportDto)).rejects.toThrow(BadRequestException);
      expect(reportRepository.insert).not.toHaveBeenCalled();
    });

    it('게시글 신고 등록에 성공한다.', async () => {
      // given
      feedRepository.findOne.mockResolvedValue({ id: 20, blog: { userId: 99 } } as any);
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
});
