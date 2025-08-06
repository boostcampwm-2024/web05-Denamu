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
              resultFile: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'uuid-string',
                  },
                  filename: {
                    type: 'string',
                    example: 'profile-image.jpg',
                  },
                  originalName: {
                    type: 'string',
                    example: 'my-photo.jpg',
                  },
                  mimeType: {
                    type: 'string',
                    example: 'image/jpeg',
                  },
                  size: {
                    type: 'number',
                    example: 1024000,
                  },
                  path: {
                    type: 'string',
                    example: '/uploads/profile/uuid-string.jpg',
                  },
                },
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
