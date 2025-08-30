import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiReadStatistic(category: 'today' | 'all') {
  const type = category === 'all' ? '전체' : '금일';
  return applyDecorators(
    ApiOperation({
      summary: `${type} 게시글 조회수 통계 API`,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '가지고 올 게시글 수',
      example: 10,
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
                id: {
                  type: 'number',
                },
                title: {
                  type: 'string',
                },
                viewCount: {
                  type: 'number',
                },
              },
            },
          },
        },
      },
      example: {
        message: `${type} 조회수 통계 조회 완료`,
        data: [
          {
            id: 1,
            title: 'testTitle',
            viewCount: 0,
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
  );
}
