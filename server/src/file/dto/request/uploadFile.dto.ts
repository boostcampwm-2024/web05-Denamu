import { ApiProperty } from '@nestjs/swagger';
import { FileUploadType } from '../../../common/disk/fileValidator';

export class UploadFileQueryRequestDto {
  @ApiProperty({
    description: '파일 업로드 타입',
    enum: FileUploadType,
    example: FileUploadType.PROFILE_IMAGE,
    required: true,
  })
  uploadType: FileUploadType;

  constructor(partial: Partial<UploadFileQueryRequestDto>) {
    Object.assign(this, partial);
  }
}
