import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiReadRecentFeedList() {
  return applyDecorators(
    ApiOperation({
      summary: '최신 피드 업데이트 API',
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
                author: { type: 'string' },
                blogPlatform: { type: 'string' },
                title: { type: 'string' },
                path: { type: 'string' },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                },
                thumbnail: { type: 'string' },
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
        },
      },
      example: {
        message: '최신 피드 업데이트 완료',
        data: [
          {
            id: 1,
            author: '블로그 이름',
            blogPlatform: 'etc',
            title: '게시글 제목',
            path: 'https://test1.com/1',
            createdAt: '2024-11-24T01:00:00.000Z',
            thumbnail: 'https://test1.com/test.png',
            viewCount: 0,
            isNew: true,
            tag: ['tag1', 'tag2'],
          },
        ],
      },
    }),
  );
}
