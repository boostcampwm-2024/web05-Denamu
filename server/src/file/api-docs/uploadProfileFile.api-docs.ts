import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileUploadType } from '@src/file/constant/file.constant';

export function ApiUploadProfileFile() {
  return applyDecorators(
    ApiOperation({
      summary: '파일 업로드 API',
      description: '사용자의 파일을 업로드합니다.',
    }),
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
                example:
                  '/objects/PROFILE_IMAGE/20241215/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg',
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
        examples: {
          fileNotSelected: {
            summary: '파일 미선택',
            value: {
              message: '파일이 선택되지 않았습니다.',
            },
          },
          invalidUploadType: {
            summary: '잘못된 업로드 타입',
            value: {
              message:
                '유효하지 않은 파일 업로드 타입입니다. 허용된 타입: PROFILE_IMAGE',
            },
          },
          invalidFileType: {
            summary: '지원하지 않는 파일 형식',
            value: {
              message:
                '지원하지 않는 파일 형식입니다. 지원 형식: image/jpeg, image/png, image/gif, image/webp',
            },
          },
          fileSizeExceeded: {
            summary: '파일 크기 초과',
            value: {
              message: '파일 크기가 너무 큽니다. 최대 5MB까지 허용됩니다.',
            },
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
