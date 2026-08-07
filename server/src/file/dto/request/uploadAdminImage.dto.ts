import { ApiProperty } from '@nestjs/swagger';

import { IsIn } from 'class-validator';

import {
  ADMIN_UPLOADABLE_IMAGE_TYPES,
  FileUploadType,
} from '@file/constant/file.constant';

export class UploadAdminImageRequestDto {
  @ApiProperty({
    description: '이미지 업로드 타입',
    enum: ADMIN_UPLOADABLE_IMAGE_TYPES,
    example: FileUploadType.BOARD_IMAGE,
    required: true,
  })
  @IsIn(ADMIN_UPLOADABLE_IMAGE_TYPES, {
    message: '지원하지 않는 파일 타입입니다.',
  })
  uploadType: FileUploadType;
}
