import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiGetComment() {
  return applyDecorators(
    ApiOperation({
      summary: '댓글 조회 API',
    }),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                comment: { type: 'string' },
                date: { type: 'string', format: 'date-time' },
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    userName: { type: 'string' },
                    profileImage: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      example: {
        message: '댓글 조회를 성공했습니다.',
        data: [
          {
            id: 1,
            comment: 'example',
            date: '2025-01-01T00:00:00.000Z',
            user: {
              id: 1,
              userName: 'example',
              profileImage: 'https://example.com',
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      example: {
        message: '게시글을 찾을 수 없습니다.',
      },
    }),
  );
}
