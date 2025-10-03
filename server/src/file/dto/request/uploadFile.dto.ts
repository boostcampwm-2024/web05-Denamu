import { ApiProperty } from '@nestjs/swagger';
import { FileUploadType } from '../../../common/disk/fileValidator';
import { IsEnum } from 'class-validator';

export class UploadFileQueryRequestDto {
  @ApiProperty({
    description: '파일 업로드 타입',
    enum: FileUploadType,
    example: FileUploadType.PROFILE_IMAGE,
    required: true,
  })
  @IsEnum(FileUploadType, {
    message: '지원하지 않는 파일 타입입니다.',
  })
  uploadType: FileUploadType;

  constructor(partial: Partial<UploadFileQueryRequestDto>) {
    Object.assign(this, partial);
  }
}
