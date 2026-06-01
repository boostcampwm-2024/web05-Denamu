import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsUUID } from 'class-validator';

export class ResetPasswordParamRequestDto {
  @ApiProperty({
    example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9',
    description: '비밀번호 재설정 인증 코드',
  })
  @IsNotEmpty({ message: '인증 코드를 입력해주세요.' })
  @IsUUID(4, { message: 'UUID v4 형식이어야 합니다.' })
  uuid: string;

  constructor(partial: Partial<ResetPasswordParamRequestDto>) {
    Object.assign(this, partial);
  }
}
