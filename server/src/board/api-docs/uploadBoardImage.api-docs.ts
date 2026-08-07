import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { UploadBoardImageResponseDto } from '@board/dto/response/uploadBoardImage.dto';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiUploadBoardImage() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '게시글 본문 이미지 업로드 API' }),
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
    ApiCreatedDataResponse(
      UploadBoardImageResponseDto,
      false,
      '이미지 업로드 성공',
    ),
    ApiBadRequestDoc('잘못된 요청'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
