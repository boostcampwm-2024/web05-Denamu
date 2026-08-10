import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AdminRepository } from '@admin/repository/admin.repository';

import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { REPORT_NOTIFIER } from '@common/notification/notifier.constant';

import { FeedRepository } from '@feed/repository/feed.repository';

import { ReportTargetType } from '@report/constant/report.constant';
import { ApproveReportRequestDto } from '@report/dto/request/approveReport.dto';
import { CreateReportRequestDto } from '@report/dto/request/createReport.dto';
import { GetReportsRequestDto } from '@report/dto/request/getReports.dto';
import { GetReportsResponseDto } from '@report/dto/response/getReports.dto';
import { Report } from '@report/entity/report.entity';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

import { SuspensionService } from '@suspension/service/suspension.service';

import { UserService } from '@user/service/user.service';

const DUPLICATE_MESSAGE = '이미 신고한 대상입니다.';

@Injectable()
export class ReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly rssAcceptRepository: RssAcceptRepository,
    private readonly commentRepository: CommentRepository,
    private readonly feedRepository: FeedRepository,
    private readonly userService: UserService,
    private readonly adminRepository: AdminRepository,
    private readonly suspensionService: SuspensionService,
    private readonly dataSource: DataSource,
    @Inject(REPORT_NOTIFIER)
    private readonly notifierRegistry: NotifierRegistry,
  ) {}

  private async saveReport(report: QueryDeepPartialEntity<Report>) {
    try {
      await this.reportRepository.insert(report);
    } catch (error) {
      if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(DUPLICATE_MESSAGE);
      }
      throw error;
    }

    void this.notifierRegistry.sendAlert(
      `🚫 새로운 신고가 접수되었습니다.\n대상 유형: ${report.targetType as ReportTargetType}\n대상 ID: ${report.targetId as number}\n사유: ${report.reason as string}`,
    );
  }

  async reportUser(
    userInformation: Payload,
    targetUserId: number,
    reportDto: CreateReportRequestDto,
  ) {
    if (userInformation.id === targetUserId) {
      throw new BadRequestException('자기 자신을 신고할 수 없습니다.');
    }
    await this.userService.getUser(targetUserId);

    await this.saveReport({
      reporter: { id: userInformation.id },
      targetType: ReportTargetType.USER,
      targetId: targetUserId,
      reportedUser: { id: targetUserId },
      reason: reportDto.reason,
      detail: reportDto.detail ?? null,
    });
  }

  async reportRss(
    userInformation: Payload,
    targetRssId: number,
    reportDto: CreateReportRequestDto,
  ) {
    const rssAccept = await this.rssAcceptRepository.findOne({
      where: { id: targetRssId },
      select: { id: true, userId: true },
    });
    if (!rssAccept) {
      throw new NotFoundException('존재하지 않는 RSS입니다.');
    }
    if (rssAccept.userId === userInformation.id) {
      throw new BadRequestException('본인 소유의 RSS는 신고할 수 없습니다.');
    }

    await this.saveReport({
      reporter: { id: userInformation.id },
      targetType: ReportTargetType.RSS,
      targetId: targetRssId,
      reportedRss: { id: targetRssId },
      reason: reportDto.reason,
      detail: reportDto.detail ?? null,
    });
  }

  async reportComment(
    userInformation: Payload,
    targetCommentId: number,
    reportDto: CreateReportRequestDto,
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id: targetCommentId },
      relations: ['user'],
    });
    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }
    if (comment.user.id === userInformation.id) {
      throw new BadRequestException('자신의 댓글은 신고할 수 없습니다.');
    }

    await this.saveReport({
      reporter: { id: userInformation.id },
      targetType: ReportTargetType.COMMENT,
      targetId: targetCommentId,
      reportedComment: { id: targetCommentId },
      reason: reportDto.reason,
      detail: reportDto.detail ?? null,
    });
  }

  async reportFeed(
    userInformation: Payload,
    targetFeedId: number,
    reportDto: CreateReportRequestDto,
  ) {
    const feed = await this.feedRepository.findOne({
      where: { id: targetFeedId, isPublic: true },
      relations: ['blog'],
    });
    if (!feed) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }
    if (feed.blog.userId === userInformation.id) {
      throw new BadRequestException('자신의 게시글은 신고할 수 없습니다.');
    }

    await this.saveReport({
      reporter: { id: userInformation.id },
      targetType: ReportTargetType.FEED,
      targetId: targetFeedId,
      reportedFeed: { id: targetFeedId },
      reason: reportDto.reason,
      detail: reportDto.detail ?? null,
    });
  }

  async getReports(queryDto: GetReportsRequestDto) {
    const limit = queryDto.limit ?? 10;
    const reports = await this.reportRepository.getReports(queryDto);

    const hasMore = reports.length > limit;
    if (hasMore) reports.pop();
    const lastId = reports.length ? reports[reports.length - 1].id : 0;

    return GetReportsResponseDto.toResponseDto(reports, lastId, hasMore);
  }

  async approveReport(
    reportId: number,
    adminEmail: string,
    approveDto: ApproveReportRequestDto,
  ) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: [
        'reportedUser',
        'reportedComment',
        'reportedComment.user',
        'reportedRss',
        'reportedFeed',
        'reportedFeed.blog',
      ],
    });
    if (!report) {
      throw new NotFoundException('존재하지 않는 신고입니다.');
    }

    const suspendedUntil = approveDto.suspendedUntil
      ? new Date(approveDto.suspendedUntil)
      : null;
    if (suspendedUntil && suspendedUntil.getTime() <= Date.now()) {
      throw new BadRequestException('정지 종료 일시는 현재 이후여야 합니다.');
    }

    let targetUserId: number | null = null;
    let targetRssId: number | null = null;

    switch (report.targetType) {
      case ReportTargetType.USER:
        targetUserId = report.reportedUser?.id ?? null;
        break;
      case ReportTargetType.COMMENT:
        targetUserId = report.reportedComment?.user?.id ?? null;
        break;
      case ReportTargetType.RSS:
        targetRssId = report.reportedRss?.id ?? null;
        break;
      case ReportTargetType.FEED:
        targetRssId = report.reportedFeed?.blog?.id ?? null;
        break;
    }

    if (!targetUserId && !targetRssId) {
      throw new BadRequestException('이미 삭제된 대상이라 정지할 수 없습니다.');
    }

    const admin = await this.adminRepository.findOneBy({ email: adminEmail });

    await this.dataSource.transaction(async (manager) => {
      const { affected } = await manager.delete(Report, { id: reportId });
      if (!affected) {
        throw new ConflictException('이미 처리된 신고입니다.');
      }

      if (targetUserId) {
        await this.suspensionService.suspendUser(manager, {
          userId: targetUserId,
          adminId: admin?.id ?? null,
          detail: approveDto.detail,
          suspendedUntil,
        });
      } else if (targetRssId) {
        await this.suspensionService.suspendRss(manager, {
          rssId: targetRssId,
          adminId: admin?.id ?? null,
          detail: approveDto.detail,
          suspendedUntil,
        });
      }
    });
  }

  async rejectReport(reportId: number) {
    const { affected } = await this.reportRepository.delete({ id: reportId });
    if (!affected) {
      throw new NotFoundException('존재하지 않는 신고입니다.');
    }
  }
}
