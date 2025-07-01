import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiReadDeleteRequestList() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 취소 신청 조회 API' }),
    ApiOkResponse({
      description: 'RSS 취소 신청 성공시',
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
                id: {
                  type: 'number',
                },
                blog: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                    },
                    name: {
                      type: 'string',
                    },
                    userName: {
                      type: 'string',
                    },
                    email: {
                      type: 'string',
                    },
                    rssUrl: {
                      type: 'string',
                    },
                    blogPlatform: {
                      type: 'string',
                    },
                  },
                },
                date: {
                  type: 'date',
                },
                reason: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      example: {
        message: 'RSS 삭제 요청을 조회하였습니다.',
        data: [
          {
            id: 1,
            date: '2025-07-01T02:48:00.000Z',
            reason: 'example reason',
            blog: {
              id: 1,
              name: 'example',
              userName: 'example',
              email: 'example@example.com',
              rssUrl: 'example.com',
              blogPlatform: 'example',
            },
          },
        ],
      },
    }),
  );
}
