import { ApiProperty } from '@nestjs/swagger';

import { UserBlock } from '@block/entity/userBlock.entity';

export class GetBlockedUsersResponseDto {
  @ApiProperty({
    example: 1,
    description: '차단된 사용자 ID',
  })
  userId: number;

  @ApiProperty({
    example: '김개발',
    description: '차단된 사용자 이름',
  })
  userName: string;

  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    description: '차단된 사용자 프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  profileImage: string | null;

  @ApiProperty({
    example: '2025-08-16T12:00:00.000Z',
    description: '차단 일시',
  })
  blockedAt: Date;

  constructor(partial: Partial<GetBlockedUsersResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDtoArray(blocks: UserBlock[]) {
    return blocks.map(
      (block) =>
        new GetBlockedUsersResponseDto({
          userId: block.blocked.id,
          userName: block.blocked.userName,
          profileImage: block.blocked.profileImage ?? null,
          blockedAt: block.createdAt,
        }),
    );
  }
}
