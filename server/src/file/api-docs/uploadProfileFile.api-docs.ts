import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiUploadProfileFile() {
  return applyDecorators(
    ApiOperation({
      summary: '프로필 이미지 업로드 API',
      description: '사용자의 프로필 이미지를 업로드합니다.',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: '업로드할 파일',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: '업로드할 이미지 파일 (JPG, PNG, GIF 등)',
          },
        },
        required: ['file'],
      },
    }),
    ApiOkResponse({
      description: '파일 업로드 성공',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '파일 업로드에 성공했습니다.',
          },
          data: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                example: 1,
                description: '파일 ID',
              },
              originalName: {
                type: 'string',
                example: 'my-photo.jpg',
                description: '원본 파일명',
              },
              mimetype: {
                type: 'string',
                example: 'image/jpeg',
                description: '파일 MIME Type',
              },
              size: {
                type: 'number',
                example: 1024000,
                description: '파일 크기 (bytes)',
              },
              url: {
                type: 'string',
                example: '/objects/profile/2024/01/profile-image.jpg',
                description: '파일 접근 URL',
              },
              userId: {
                type: 'number',
                example: 123,
                description: '업로드한 사용자 ID',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T12:00:00.000Z',
                description: '업로드 날짜',
              },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: '잘못된 요청',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '파일이 선택되지 않았습니다.',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '인증되지 않은 사용자',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '인증이 필요합니다.',
          },
        },
      },
    }),
  );
}
