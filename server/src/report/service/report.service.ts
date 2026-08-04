import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CommentRepository } from '@comment/repository/comment.repository';

import { Payload } from '@common/guard/jwt.guard';
import { NotifierRegistry } from '@common/notification/notifier-registry';
import { REPORT_NOTIFIER } from '@common/notification/notifier.constant';

import { FeedRepository } from '@feed/repository/feed.repository';

import { ReportTargetType } from '@report/constant/report.constant';
import { CreateReportRequestDto } from '@report/dto/request/createReport.dto';
import { GetReportsRequestDto } from '@report/dto/request/getReports.dto';
import { GetReportsResponseDto } from '@report/dto/response/getReports.dto';
import { Report } from '@report/entity/report.entity';
import { ReportRepository } from '@report/repository/report.repository';

import { RssAcceptRepository } from '@rss/repository/rss.repository';

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
}
