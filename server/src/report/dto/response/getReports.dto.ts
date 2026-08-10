import { ApiProperty } from '@nestjs/swagger';

import {
  ReportReason,
  ReportTargetType,
} from '@report/constant/report.constant';
import { Report } from '@report/entity/report.entity';

class ReportTargetUser {
  @ApiProperty({ example: 1, description: '유저 ID (프로필 링크용)' })
  id: number;

  @ApiProperty({ example: '테스트 계정', description: '이름' })
  userName: string;

  @ApiProperty({ example: null, description: '프로필 이미지', nullable: true })
  profileImage: string | null;
}

class ReportTargetFeed {
  @ApiProperty({ example: 1, description: '게시글 ID (링크용)' })
  id: number;

  @ApiProperty({ example: '게시글 제목', description: '게시글 제목' })
  title: string;

  @ApiProperty({ example: null, description: '게시글 썸네일', nullable: true })
  thumbnail: string | null;
}

class ReportTargetRss {
  @ApiProperty({ example: 1, description: 'RSS ID (링크용)' })
  id: number;

  @ApiProperty({ example: '블로그 이름', description: 'RSS 이름' })
  name: string;

  @ApiProperty({
    example: null,
    description: 'RSS 프로필 이미지',
    nullable: true,
  })
  image: string | null;
}

class ReportTargetDetail {
  @ApiProperty({
    type: ReportTargetFeed,
    description: '게시글 정보 (댓글·게시글 신고)',
    nullable: true,
  })
  feed: ReportTargetFeed | null;

  @ApiProperty({
    type: ReportTargetRss,
    description: 'RSS 정보 (게시글·RSS 신고)',
    nullable: true,
  })
  rss: ReportTargetRss | null;

  @ApiProperty({
    type: ReportTargetUser,
    description: 'RSS 소유자 정보 (게시글·RSS 신고)',
    nullable: true,
  })
  rssOwner: ReportTargetUser | null;

  @ApiProperty({
    type: ReportTargetUser,
    description: '유저 정보 (유저 신고) 또는 댓글 작성자 정보 (댓글 신고)',
    nullable: true,
  })
  user: ReportTargetUser | null;

  @ApiProperty({
    example: null,
    description: '댓글 내용 (댓글 신고)',
    nullable: true,
  })
  comment: string | null;
}

function toTargetUser(
  user: { id: number; userName: string; profileImage: string | null } | null,
): ReportTargetUser | null {
  return user
    ? { id: user.id, userName: user.userName, profileImage: user.profileImage }
    : null;
}

function resolveTarget(report: Report): ReportTargetDetail {
  switch (report.targetType) {
    case ReportTargetType.USER:
      return {
        feed: null,
        rss: null,
        rssOwner: null,
        user: toTargetUser(report.reportedUser),
        comment: null,
      };
    case ReportTargetType.COMMENT:
      return {
        feed: report.reportedComment.feed
          ? {
              id: report.reportedComment.feed.id,
              title: report.reportedComment.feed.title,
              thumbnail: report.reportedComment.feed.thumbnail,
            }
          : null,
        rss: null,
        rssOwner: null,
        user: toTargetUser(report.reportedComment.user),
        comment: report.reportedComment.comment,
      };
    case ReportTargetType.FEED:
      return {
        feed: {
          id: report.reportedFeed.id,
          title: report.reportedFeed.title,
          thumbnail: report.reportedFeed.thumbnail,
        },
        rss: report.reportedFeed.blog
          ? {
              id: report.reportedFeed.blog.id,
              name: report.reportedFeed.blog.name,
              image: report.reportedFeed.blog.blogImage,
            }
          : null,
        rssOwner: toTargetUser(report.reportedFeed.blog.user),
        user: null,
        comment: null,
      };
    case ReportTargetType.RSS:
      return {
        feed: null,
        rss: {
          id: report.reportedRss.id,
          name: report.reportedRss.name,
          image: report.reportedRss.blogImage,
        },
        rssOwner: toTargetUser(report.reportedRss.user),
        user: null,
        comment: null,
      };
    default:
      throw new Error(
        `처리할 수 없는 신고 대상 타입입니다: ${report.targetType as string}`,
      );
  }
}

export class ReportResult {
  @ApiProperty({ example: 1, description: '신고 ID' })
  id: number;

  @ApiProperty({ enum: ReportTargetType, description: '신고 대상 타입' })
  targetType: ReportTargetType;

  @ApiProperty({
    example: 1,
    description: '신고 대상 ID',
  })
  targetId: number;

  @ApiProperty({
    type: ReportTargetDetail,
    description:
      '신고 대상 상세 정보. 대상 삭제 시 report row도 CASCADE로 함께 삭제되므로 항상 존재',
  })
  target: ReportTargetDetail;

  @ApiProperty({ enum: ReportReason, description: '신고 사유' })
  reason: ReportReason;

  @ApiProperty({ example: null, description: '신고 상세 내용', nullable: true })
  detail: string | null;

  @ApiProperty({
    example: { userName: '테스트 계정' },
    description: '신고자 정보 (탈퇴한 경우 null)',
    nullable: true,
  })
  reporter: { userName: string } | null;

  @ApiProperty({
    example: '2025-08-16T12:00:00.000Z',
    description: '신고 접수 일시',
  })
  createdAt: Date;

  private constructor(partial: Partial<ReportResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(report: Report) {
    return new ReportResult({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      target: resolveTarget(report),
      reason: report.reason,
      detail: report.detail,
      reporter: report.reporter ? { userName: report.reporter.userName } : null,
      createdAt: report.createdAt,
    });
  }

  static toResultDtoArray(reports: Report[]) {
    return reports.map((report) => this.toResultDto(report));
  }
}

export class GetReportsResponseDto {
  @ApiProperty({ type: [ReportResult], description: '신고 목록' })
  result: ReportResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 신고 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<GetReportsResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(reports: Report[], lastId: number, hasMore: boolean) {
    return new GetReportsResponseDto({
      result: ReportResult.toResultDtoArray(reports),
      lastId,
      hasMore,
    });
  }
}
