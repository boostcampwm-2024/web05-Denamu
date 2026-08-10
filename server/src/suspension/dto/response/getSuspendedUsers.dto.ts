import { ApiProperty } from '@nestjs/swagger';

import { UserSuspension } from '@suspension/entity/userSuspension.entity';

export class SuspendedUserResult {
  @ApiProperty({ example: 1, description: '정지 내역 ID' })
  id: number;

  @ApiProperty({
    example: { userName: '테스트 계정', email: 'test@denamu.dev' },
    description: '정지된 유저 정보',
  })
  user: { userName: string; email: string };

  @ApiProperty({
    example: { name: '관리자1' },
    description: '정지를 처리한 관리자 정보 (탈퇴 등으로 없는 경우 null)',
    nullable: true,
  })
  admin: { name: string } | null;

  @ApiProperty({ example: '악성 댓글 반복 작성', description: '정지 사유' })
  detail: string;

  @ApiProperty({
    example: null,
    description: '정지 종료 일시 (영구 정지인 경우 null)',
    nullable: true,
  })
  suspendedUntil: Date | null;

  @ApiProperty({
    example: '2025-08-16T12:00:00.000Z',
    description: '정지 처리 일시',
  })
  createdAt: Date;

  private constructor(partial: Partial<SuspendedUserResult>) {
    Object.assign(this, partial);
  }

  static toResultDto(suspension: UserSuspension) {
    return new SuspendedUserResult({
      id: suspension.id,
      user: {
        userName: suspension.user.userName,
        email: suspension.user.email,
      },
      admin: suspension.admin ? { name: suspension.admin.name } : null,
      detail: suspension.detail,
      suspendedUntil: suspension.suspendedUntil,
      createdAt: suspension.createdAt,
    });
  }

  static toResultDtoArray(suspensions: UserSuspension[]) {
    return suspensions.map((suspension) => this.toResultDto(suspension));
  }
}

export class GetSuspendedUsersResponseDto {
  @ApiProperty({ type: [SuspendedUserResult], description: '정지된 유저 목록' })
  result: SuspendedUserResult[];

  @ApiProperty({
    example: 1,
    description: '마지막으로 조회한 정지 내역 ID (다음 요청의 커서)',
  })
  lastId: number;

  @ApiProperty({ example: true, description: '다음 페이지 존재 여부' })
  hasMore: boolean;

  constructor(partial: Partial<GetSuspendedUsersResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(
    suspensions: UserSuspension[],
    lastId: number,
    hasMore: boolean,
  ) {
    return new GetSuspendedUsersResponseDto({
      result: SuspendedUserResult.toResultDtoArray(suspensions),
      lastId,
      hasMore,
    });
  }
}
