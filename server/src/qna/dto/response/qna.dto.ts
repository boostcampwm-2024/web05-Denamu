import { ApiProperty } from '@nestjs/swagger';

export class QnaCreatedDto {
  @ApiProperty({ example: 1, description: '생성된 문의 ID' })
  id: number;

  constructor(partial: Partial<QnaCreatedDto>) {
    Object.assign(this, partial);
  }

  static of(id: number): QnaCreatedDto {
    return new QnaCreatedDto({ id });
  }
}
