import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { UploadImageResponseDto } from '@file/dto/response/uploadImage.dto';

export function ApiUploadAdminImage() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 이미지 업로드 API' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: '업로드할 이미지 파일',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '업로드할 이미지 (png, jpg, jpeg, webp, gif)',
          },
        },
        required: ['file'],
      },
    }),
    ApiCreatedDataResponse(UploadImageResponseDto, false, '이미지 업로드 성공'),
    ApiBadRequestDoc('잘못된 요청'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
