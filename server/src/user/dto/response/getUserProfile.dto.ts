import { ApiProperty } from '@nestjs/swagger';

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

  constructor(partial: Partial<GetUserProfileResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(user: User) {
    return new GetUserProfileResponseDto({
      userName: user.userName,
      profileImage: user.profileImage ?? null,
      introduction: user.introduction ?? null,
      maxStreak: user.maxStreak,
      currentStreak: user.currentStreak,
      totalViews: user.totalViews,
    });
  }
}
