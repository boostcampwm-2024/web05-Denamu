import { ApiProperty } from '@nestjs/swagger';

import { User } from '@user/entity/user.entity';

export class SearchUserResult {
  @ApiProperty({ example: 1, description: '유저 ID' })
  id: number;

  @ApiProperty({ example: '김개발', description: '유저 닉네임' })
  userName: string;

  @ApiProperty({
    example: 'https://denamu.dev/objects/PROFILE_IMAGE/20250816/uuid.png',
    description: '프로필 이미지 URL (미설정 시 null)',
    nullable: true,
  })
  profileImage: string | null;

  private constructor(partial: Partial<SearchUserResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(user: User) {
    return new SearchUserResult({
      id: user.id,
      userName: user.userName,
      profileImage: user.profileImage ?? null,
    });
  }

  static toResultDtoArray(users: User[]) {
    return users.map((user) => this.toResultDto(user));
  }
}

export class SearchUserResponseDto {
  @ApiProperty({
    example: 1,
    description: '전체 유저 개수',
  })
  totalCount: number;

  @ApiProperty({ type: [SearchUserResult], description: '검색 결과 유저' })
  result: SearchUserResult[];

  @ApiProperty({
    example: 10,
    description: '총 페이지 수',
  })
  totalPages: number;

  @ApiProperty({
    example: 5,
    description: '한 페이지 최대 유저 개수',
  })
  limit: number;

  constructor(partial: Partial<SearchUserResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    totalCount: number,
    users: SearchUserResult[],
    totalPages: number,
    limit: number,
  ) {
    return new SearchUserResponseDto({
      totalCount,
      result: users,
      totalPages,
      limit,
    });
  }
}
