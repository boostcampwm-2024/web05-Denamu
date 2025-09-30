import { ApiProperty } from '@nestjs/swagger';
import { FileUploadType } from '../../../common/disk/fileValidator';

export class UploadFileQueryDto {
  @ApiProperty({
    description: '파일 업로드 타입',
    enum: FileUploadType,
    example: FileUploadType.PROFILE_IMAGE,
    required: true,
  })
  uploadType: FileUploadType;

  constructor(partial: Partial<UploadFileQueryDto>) {
    Object.assign(this, partial);
  }
}
