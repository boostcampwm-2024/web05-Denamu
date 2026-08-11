import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    example: '/objects/BOARD_IMAGE/2026-08-06/example.jpg',
    description: '업로드된 이미지 접근 URL',
  })
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
