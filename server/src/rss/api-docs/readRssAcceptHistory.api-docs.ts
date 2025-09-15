import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiReadRssAcceptHistory() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 승인 기록 API',
    }),
    ApiOkResponse({
      description: '기록 조회 성공시',
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
                name: {
                  type: 'string',
                },
                userName: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                  format: 'email',
                },
                rssUrl: {
                  type: 'string',
                  format: 'url',
                },
                blogPlatform: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      example: {
        message: '승인 기록 조회가 완료되었습니다.',
        data: [
          {
            id: 1,
            name: '블로그 이름',
            userName: '사용자 이름',
            email: 'test@test.com',
            rssUrl: 'https://test/rss',
            blogPlatform: 'etc',
          },
        ],
      },
    }),
    ApiUnauthorizedResponse({
      description: '유효한 사용자 세션이 존재하지 않는 경우',
      example: {
        message: '인증되지 않은 요청입니다.',
      },
    }),
  );
}
