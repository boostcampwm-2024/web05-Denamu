import { ApiProperty } from '@nestjs/swagger';

import { UserSearchRow } from '@user/repository/user.repository';

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

  @ApiProperty({
    example: '안녕하세요, 프론트엔드 개발자입니다.',
    description: '유저 자기소개 (미설정 시 null)',
    nullable: true,
  })
  introduction: string | null;

  @ApiProperty({ example: 3, description: '유저가 소유한 RSS 블로그 개수' })
  blogCount: number;

  private constructor(partial: Partial<SearchUserResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(row: UserSearchRow) {
    return new SearchUserResult({
      id: row.id,
      userName: row.userName,
      profileImage: row.profileImage ?? null,
      introduction: row.introduction ?? null,
      blogCount: row.blogCount,
    });
  }

  static toResultDtoArray(rows: UserSearchRow[]) {
    return rows.map((row) => this.toResultDto(row));
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
