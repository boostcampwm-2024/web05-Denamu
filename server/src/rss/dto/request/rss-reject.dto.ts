import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectRssRequestDto {
  @ApiProperty({
    example: '거부 사유',
    description: '거부 사유를 입력해주세요.',
  })
  @IsNotEmpty({ message: '거부 사유를 필수로 입력해야 합니다.' })
  @IsString({ message: '거부 사유를 문자열로 작성해주세요.' })
  description: string;

  constructor(partial: Partial<RejectRssRequestDto>) {
    Object.assign(this, partial);
  }
}
