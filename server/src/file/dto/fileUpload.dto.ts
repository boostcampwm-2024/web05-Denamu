import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { FileUploadType } from '../../common/disk/file-validator';

export class FileUploadQueryDto {
  @ApiProperty({
    description: '파일 업로드 타입',
    enum: FileUploadType,
    example: FileUploadType.PROFILE_IMAGE,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value)
  uploadType: FileUploadType;
}
