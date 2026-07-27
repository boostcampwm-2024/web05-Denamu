import { ApiProperty } from '@nestjs/swagger';

import { NotificationType } from '@notification/entity/notification.entity';

type NotificationRawRow = {
  id: number;
  type: NotificationType;
  isRead: number | boolean;
  updatedAt: Date;
  feedId: number;
  feedTitle: string;
  feedPath: string;
  actorUserName: string | null;
  actorProfileImage: string | null;
  otherLikersCount: string | number;
};

export class NotificationItemResult {
  @ApiProperty({ example: 1, description: '알림 ID' })
  id: number;

  @ApiProperty({ example: 'LIKE', enum: NotificationType, description: '알림 종류' })
  type: NotificationType;

  @ApiProperty({ example: false, description: '읽음 여부' })
  isRead: boolean;

  @ApiProperty({ example: '2026-07-26T00:00:00.000Z', description: '알림 갱신 시각(표시 기준 시각)' })
  updatedAt: Date;

  @ApiProperty({
    example: { id: 1, title: 'example title', path: 'https://example.com/feed' },
    description: '알림 대상 게시글 정보',
  })
  feed: {
    id: number;
    title: string;
    path: string;
  };

  @ApiProperty({
    example: { userName: 'liker', profileImage: null },
    description: '알림을 발생시킨 유저 정보(현재 최신 좋아요 사용자에서 파생)',
  })
  actor: {
    userName: string | null;
    profileImage: string | null;
  };

  @ApiProperty({
    example: 2,
    description: '표시된 actor를 제외하고 이 게시글에 좋아요를 누른 다른 사람 수(수신자 본인 제외)',
  })
  otherCount: number;

  private constructor(partial: Partial<NotificationItemResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(row: NotificationRawRow) {
    return new NotificationItemResult({
      id: row.id,
      type: row.type,
      isRead: !!row.isRead,
      updatedAt: row.updatedAt,
      feed: {
        id: row.feedId,
        title: row.feedTitle,
        path: row.feedPath,
      },
      actor: {
        userName: row.actorUserName,
        profileImage: row.actorProfileImage,
      },
      otherCount: Math.max(0, Number(row.otherLikersCount) - 1),
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
