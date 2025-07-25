import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FileUploadResponseDto {
  @ApiProperty({ description: '파일 ID' })
  id: string;

  @ApiProperty({ description: '저장된 파일명' })
  filename: string;

  @ApiProperty({ description: '파일 MIME Type' })
  mimeType: string;

  @ApiProperty({ description: '파일 크기 (bytes)' })
  size: number;

  @ApiProperty({ description: '업로드 날짜' })
  createdAt: Date;
}
