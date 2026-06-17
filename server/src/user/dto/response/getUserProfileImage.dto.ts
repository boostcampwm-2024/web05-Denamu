import { ApiProperty } from '@nestjs/swagger';

import { User } from '@user/entity/user.entity';

export class GetUserProfileImageResponseDto {
  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    description: '프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  profileImage: string | null;

  constructor(partial: Partial<GetUserProfileImageResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(user: User) {
    return new GetUserProfileImageResponseDto({
      profileImage: user.profileImage ?? null,
    });
  }
}
