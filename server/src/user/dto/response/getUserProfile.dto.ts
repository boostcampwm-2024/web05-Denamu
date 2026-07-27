import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

import { User } from '@user/entity/user.entity';

export class GetUserProfileResponseDto {
  @ApiProperty({
    example: '김개발',
    description: '사용자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    description: '프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  profileImage: string | null;

  @ApiProperty({
    example: '안녕하세요! 김개발입니다.',
    description: '자기소개 (미설정 시 null)',
    nullable: true,
  })
  introduction: string | null;

  @ApiProperty({
    example: 15,
    description: '사용자의 최장 읽기 스트릭',
  })
  maxStreak: number;

  @ApiProperty({
    example: 7,
    description: '사용자의 현재 읽기 스트릭',
  })
  currentStreak: number;

  @ApiProperty({
    example: 120,
    description: '사용자의 총 읽기 횟수',
  })
  totalViews: number;

  @ApiProperty({
    example: false,
    description: '요청자가 해당 사용자를 차단했는지 여부 (비로그인 시 false)',
  })
  isBlocked: boolean;

  @ApiPropertyOptional({
    example: false,
    description:
      '마케팅 활용 및 광고성 정보 수신 동의 여부 (본인 프로필 조회 시에만 포함)',
  })
  marketingEmailAgreed?: boolean;

  @ApiPropertyOptional({
    example: '2026-07-27T12:00:00.000Z',
    description:
      '마케팅 활용 및 광고성 정보 수신 동의/철회 시각 (미동의 상태이면 null, 본인 프로필 조회 시에만 포함)',
    nullable: true,
  })
  marketingEmailAgreedAt?: Date | null;

  @ApiPropertyOptional({
    example: false,
    description:
      '미접속 알림 이메일 수신 동의 여부 (본인 프로필 조회 시에만 포함)',
  })
  inactivityEmailAgreed?: boolean;

  @ApiPropertyOptional({
    example: '2026-07-27T12:00:00.000Z',
    description:
      '미접속 알림 이메일 수신 동의/철회 시각 (미동의 상태이면 null, 본인 프로필 조회 시에만 포함)',
    nullable: true,
  })
  inactivityEmailAgreedAt?: Date | null;

  @ApiPropertyOptional({
    example: false,
    description:
      '공지사항 이메일 수신 동의 여부 (본인 프로필 조회 시에만 포함)',
  })
  noticeEmailAgreed?: boolean;

  @ApiPropertyOptional({
    example: '2026-07-27T12:00:00.000Z',
    description:
      '공지사항 이메일 수신 동의/철회 시각 (미동의 상태이면 null, 본인 프로필 조회 시에만 포함)',
    nullable: true,
  })
  noticeEmailAgreedAt?: Date | null;

  constructor(partial: Partial<GetUserProfileResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(user: User, isBlocked = false, isOwner = false) {
    return new GetUserProfileResponseDto({
      userName: user.userName,
      profileImage: user.profileImage ?? null,
      introduction: user.introduction ?? null,
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
      isBlocked,
      marketingEmailAgreed: isOwner ? user.marketingEmailAgreed : undefined,
      marketingEmailAgreedAt: isOwner
        ? user.marketingEmailAgreedAt
        : undefined,
      inactivityEmailAgreed: isOwner ? user.inactivityEmailAgreed : undefined,
      inactivityEmailAgreedAt: isOwner
        ? user.inactivityEmailAgreedAt
        : undefined,
      noticeEmailAgreed: isOwner ? user.noticeEmailAgreed : undefined,
      noticeEmailAgreedAt: isOwner ? user.noticeEmailAgreedAt : undefined,
    });
  }
}
