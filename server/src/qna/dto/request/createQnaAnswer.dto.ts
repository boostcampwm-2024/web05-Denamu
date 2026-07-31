import { ApiProperty } from '@nestjs/swagger';

import { IsString } from 'class-validator';

export class CreateQnaAnswerRequestDto {
  @ApiProperty({
    description: '답변 내용',
    example: '문의주신 내용은 확인 후 조치되었습니다.',
  })
  @IsString({ message: '문자열로 입력해주세요.' })
  content: string;

  constructor(partial: Partial<CreateQnaAnswerRequestDto>) {
    Object.assign(this, partial);
  }
}
