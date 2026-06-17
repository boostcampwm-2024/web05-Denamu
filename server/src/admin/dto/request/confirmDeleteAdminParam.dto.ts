import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmDeleteAdminParamRequestDto {
  @ApiProperty({
    example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    description: '관리자 회원탈퇴 인증 토큰',
  })
  @IsNotEmpty({ message: '인증 토큰을 입력해주세요.' })
  @IsUUID(4, { message: 'UUID v4 형식이어야 합니다.' })
  token: string;

  constructor(partial: Partial<ConfirmDeleteAdminParamRequestDto>) {
    Object.assign(this, partial);
  }
}
