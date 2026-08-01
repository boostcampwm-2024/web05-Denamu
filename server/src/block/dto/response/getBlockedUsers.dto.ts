import { ApiProperty } from '@nestjs/swagger';

import { UserBlock } from '@block/entity/userBlock.entity';

export class GetBlockedUsersResponseDto {
  @ApiProperty({
    example: { id: 1, userName: '김개발', profileImage: null },
    description: '차단된 사용자 정보',
  })
  user: {
    id: number;
    userName: string;
    profileImage: string | null;
  };

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
          user: {
            id: block.blocked.id,
            userName: block.blocked.userName,
            profileImage: block.blocked.profileImage ?? null,
          },
          blockedAt: block.createdAt,
        }),
    );
  }
}
