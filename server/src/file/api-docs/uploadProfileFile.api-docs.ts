import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { FileUploadType } from '@file/constant/file.constant';
import { UploadFileResponseDto } from '@file/dto/response/uploadFile.dto';

export function ApiUploadProfileFile() {
  return applyDecorators(
    ApiOperation({
      summary: '파일 업로드 API',
      description: '사용자의 파일을 업로드합니다.',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiQuery({
      name: 'uploadType',
      description: '파일 업로드 타입',
      enum: FileUploadType,
      example: FileUploadType.PROFILE_IMAGE,
      required: true,
    }),
    ApiBody({
      description: '업로드할 파일',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '업로드할 파일 (uploadType별 허용 형식 다름!)',
          },
        },
        required: ['file'],
      },
    }),
    ApiCreatedDataResponse(UploadFileResponseDto, false, '파일 업로드 성공'),
    ApiBadRequestDoc('잘못된 요청'),
    ApiUnauthorizedDoc('인증되지 않은 사용자'),
  );
}
