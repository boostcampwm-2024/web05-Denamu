import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiReadFeedPagination() {
  return applyDecorators(
    ApiOperation({
      summary: `메인 화면 게시글 조회 API`,
    }),
    ApiQuery({
      name: 'lastId',
      required: false,
      type: Number,
      description: '마지막으로 받은 피드의 ID',
      example: 10,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '한 번에 가져올 피드 수',
      example: 5,
      default: 12,
    }),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
            properties: {
              result: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    author: { type: 'string' },
                    blogPlatform: { type: 'string' },
                    title: { type: 'string' },
                    path: { type: 'string', format: 'url' },
                    createdAt: { type: 'string', format: 'date-time' },
                    thumbnail: { type: 'string', format: 'url' },
                    viewCount: { type: 'number' },
                    isNew: { type: 'boolean' },
                    tag: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
              lastId: { type: 'number' },
              hasMore: { type: 'boolean' },
            },
          },
        },
      },
      example: {
        message: '피드 조회 완료',
        data: {
          result: [
            {
              id: 3,
              author: '블로그 이름',
              blogPlatform: '블로그 서비스 플랫폼',
              title: '피드 제목',
              path: 'https://test.com',
              createdAt: '2024-06-16T20:00:57.000Z',
              thumbnail: 'https://test.com/image.png',
              viewCount: 1,
              isNew: false,
              tag: ['tag1', 'tag2'],
            },
          ],
          lastId: 3,
          hasMore: true,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
  );
}
