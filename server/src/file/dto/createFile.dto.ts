import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty({ description: '파일 ID' })
  id: number;

  @ApiProperty({ description: '원본 파일명' })
  originalName: string;

  @ApiProperty({ description: '파일 MIME Type' })
  mimetype: string;

  @ApiProperty({ description: '파일 크기 (bytes)' })
  size: number;

  @ApiProperty({ description: '파일 접근 URL' })
  url: string;

  @ApiProperty({ description: '업로드한 사용자 ID' })
  userId: number;

  @ApiProperty({ description: '업로드 날짜' })
  createdAt: Date;
}
