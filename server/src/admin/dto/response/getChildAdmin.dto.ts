import { ApiProperty } from '@nestjs/swagger';

import { Admin } from '@admin/entity/admin.entity';

export class GetChildAdminResponseDto {
  @ApiProperty({
    example: 1,
    description: '관리자 ID',
  })
  id: number;

  @ApiProperty({
    example: 'sub-admin',
    description: '관리자 로그인 아이디',
  })
  loginId: string;

  @ApiProperty({
    example: '홍길동',
    description: '관리자 이름',
  })
  name: string;

  constructor(partial: Partial<GetChildAdminResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(admin: Admin) {
    return new GetChildAdminResponseDto({
      id: admin.id,
      loginId: admin.loginId,
      name: admin.name,
    });
  }
}
