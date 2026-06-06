import { ApiProperty } from '@nestjs/swagger';

export class GetSessionAdminResponseDto {
  @ApiProperty({
    example: '홍길동',
    description: '관리자 이름',
  })
  name: string;

  constructor(partial: Partial<GetSessionAdminResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(name: string) {
    return new GetSessionAdminResponseDto({ name });
  }
}
