import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateRssCertificationRequestDto {
  @ApiProperty({
    description: '수정할 블로그 이름을 입력해주세요.',
    example: 'seok3765.log',
  })
  @IsNotEmpty({
    message: '블로그 이름을 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  @MaxLength(255, {
    message: '블로그 이름은 255자 이하로 입력해주세요.',
  })
  name: string;

  @ApiProperty({
    description: '수정할 신청자 이름을 입력해주세요.',
    example: '조민석',
  })
  @IsNotEmpty({
    message: '신청자 이름을 입력해주세요.',
  })
  @IsString({
    message: '문자열로 입력해주세요.',
  })
  @MaxLength(50, {
    message: '신청자 이름은 50자 이하로 입력해주세요.',
  })
  userName: string;

  constructor(partial: Partial<UpdateRssCertificationRequestDto>) {
    Object.assign(this, partial);
  }
}
