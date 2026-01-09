import { ApiProperty } from '@nestjs/swagger';
import { File } from '@src/file/entity/file.entity';

export class UploadFileResponseDto {
  @ApiProperty({
    example: 1,
    description: '파일 ID',
  })
  id: number;

  @ApiProperty({
    example: 'example.jpg',
    description: '원본 파일명',
  })
  originalName: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: '파일 MIME Type',
  })
  mimetype: string;

  @ApiProperty({
    example: 1024000,
    description: '파일 크기 (bytes)',
  })
  size: number;

  @ApiProperty({
    example: '/objects/profile/2024/01/example.jpg',
    description: '파일 접근 URL',
  })
  url: string;

  @ApiProperty({
    example: 1,
    description: '업로드한 사용자 ID',
  })
  userId: number;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: '업로드 날짜',
  })
  createdAt: Date;

  private constructor(partial: Partial<UploadFileResponseDto>) {
    Object.assign(this, partial);
  }

  static toResponseDto(savedFile: File, accessUrl: string) {
    return new UploadFileResponseDto({
      id: savedFile.id,
      originalName: savedFile.originalName,
      mimetype: savedFile.mimetype,
      size: savedFile.size,
      url: accessUrl,
      userId: savedFile.user.id,
      createdAt: savedFile.createdAt,
    });
  }
}
