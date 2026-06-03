import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: '오류 메시지', description: '에러 메시지' })
  message: string;
}
