import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class OAuthRegistrationRequestDto {
  @ApiProperty({
    example: '홍길동',
    description: '사용할 닉네임을 입력해주세요.',
  })
  @IsString({ message: '닉네임은 문자열로 입력해주세요.' })
  @IsNotEmpty({ message: '닉네임이 없습니다.' })
  userName: string;

  constructor(partial: Partial<OAuthRegistrationRequestDto>) {
    Object.assign(this, partial);
  }
}
