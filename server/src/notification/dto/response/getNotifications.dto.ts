import { ApiProperty } from '@nestjs/swagger';

import { NotificationType } from '@notification/entity/notification.entity';
import { toCommentPreview } from '@notification/util/commentPreview.util';

type NotificationRawRow = {
  id: number;
  type: NotificationType;
  isRead: number | boolean;
  updatedAt: Date;
  feedId: number | null;
  feedTitle: string | null;
  feedPath: string | null;
  rssId: number | null;
  rssName: string | null;
  actorUserName: string | null;
  actorProfileImage: string | null;
  otherActorsCount: string | number;
  commentContent: string | null;
  commentId: number | null;
};

export class NotificationItemResult {
  @ApiProperty({ example: 1, description: '알림 ID' })
  id: number;

  @ApiProperty({
    example: 'LIKE',
    enum: NotificationType,
    description: '알림 종류',
  })
  type: NotificationType;

  @ApiProperty({ example: false, description: '읽음 여부' })
  isRead: boolean;

  @ApiProperty({
    example: '2026-07-26T00:00:00.000Z',
    description: '알림 갱신 시각(표시 기준 시각)',
  })
  updatedAt: Date;

  @ApiProperty({
    example: {
      id: 1,
      title: 'example title',
      path: 'https://example.com/feed',
    },
    description: '알림 대상 게시글 정보(LIKE/COMMENT 알림에 존재)',
    nullable: true,
  })
  feed: {
    id: number;
    title: string;
    path: string;
  } | null;

  @ApiProperty({
    example: { id: 1, name: 'seok3765.log' },
    description: '알림 대상 RSS 정보(SUBSCRIBE 알림에만 존재)',
    nullable: true,
  })
  rss: {
    id: number;
    name: string;
  } | null;

  @ApiProperty({
    example: { userName: 'liker', profileImage: null },
    description:
      '알림을 발생시킨 유저 정보(타입별 최신 행위자에서 파생: LIKE는 좋아요, COMMENT는 댓글, SUBSCRIBE는 구독한 유저)',
  })
  actor: {
    userName: string | null;
    profileImage: string | null;
  };

  @ApiProperty({
    example: 2,
    description:
      '표시된 actor를 제외하고 이 게시글에 좋아요/댓글/구독을 한 다른 사람 수(수신자 본인 제외)',
  })
  otherCount: number;

  @ApiProperty({
    example: '이 글 정말 잘 읽었습니다...',
    nullable: true,
    description:
      'COMMENT 타입일 때 최신 댓글 내용 일부(40자 초과 시 말줄임). LIKE는 항상 null',
  })
  commentPreview: string | null;

  @ApiProperty({
    example: 42,
    nullable: true,
    description: 'COMMENT 타입일 때 최신 댓글의 ID(하이라이트/이동용). LIKE는 항상 null',
  })
  commentId: number | null;

  private constructor(partial: Partial<NotificationItemResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(row: NotificationRawRow) {
    return new NotificationItemResult({
      id: row.id,
      type: row.type,
      isRead: !!row.isRead,
      updatedAt: row.updatedAt,
      feed: row.feedId
        ? {
            id: row.feedId,
            title: row.feedTitle,
            path: row.feedPath,
          }
        : null,
      rss: row.rssId
        ? {
            id: row.rssId,
            name: row.rssName,
          }
        : null,
      actor: {
        userName: row.actorUserName,
        profileImage: row.actorProfileImage,
      },
      otherCount: Math.max(0, Number(row.otherActorsCount) - 1),
      commentPreview: toCommentPreview(row.commentContent),
      commentId: row.commentId ?? null,
    });
  }

  static toResultDtoArray(rows: NotificationRawRow[]) {
    return rows.map((row) => this.toResultDto(row));
  }
}

export class GetNotificationsResponseDto {
  @ApiProperty({ type: [NotificationItemResult], description: '알림 목록' })
  result: NotificationItemResult[];

  constructor(partial: Partial<GetNotificationsResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(rows: NotificationRawRow[]) {
    return new GetNotificationsResponseDto({
      result: NotificationItemResult.toResultDtoArray(rows),
    });
  }
}
