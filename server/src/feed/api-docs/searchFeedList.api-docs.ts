import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchType } from '../dto/request/search-feed.dto';

export function ApiSearchFeedList() {
  return applyDecorators(
    ApiOperation({
      summary: `검색 API`,
    }),
    ApiQuery({
      name: 'find',
      required: true,
      type: String,
      description: '검색어',
      example: 'test',
    }),
    ApiQuery({
      name: 'type',
      required: true,
      enum: SearchType,
      description: '검색 타입',
      example: SearchType.ALL,
    }),
    ApiQuery({
      name: 'page',
      required: true,
      type: Number,
      description: '페이지 번호',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: true,
      type: Number,
      description: '한 페이지에 보여줄 개수',
      example: 4,
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
              totalCount: {
                type: 'number',
              },
              result: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                    },
                    blogName: {
                      type: 'string',
                    },
                    title: {
                      type: 'string',
                    },
                    path: {
                      type: 'string',
                      format: 'url',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
              totalPages: {
                type: 'number',
              },
              limit: {
                type: 'number',
              },
            },
          },
        },
      },
      example: {
        message: '검색 결과 조회 완료',
        data: {
          totalCount: 1,
          result: [
            {
              id: 1,
              blogName: '블로그 이름',
              title: 'test',
              path: 'https://test.com/1',
              createdAt: '2024-10-27T02:08:55.000Z',
            },
          ],
          totalPages: 3,
          limit: 1,
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
