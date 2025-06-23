import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiReadFeedDetail() {
  return applyDecorators(
    ApiOperation({
      summary: `게시글 상세 모달 데이터 조회 API`,
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
              id: { type: 'number' },
              author: { type: 'string' },
              blogPlatform: { type: 'string' },
              title: { type: 'string' },
              path: { type: 'string', format: 'url' },
              createdAt: { type: 'string', format: 'date-time' },
              thumbnail: { type: 'string', format: 'url' },
              viewCount: { type: 'number' },
              summary: { type: 'string' },
              tag: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              likes: { type: 'number' },
              isLike: { type: 'boolean' },
            },
          },
        },
      },
      example: {
        message: '피드 상세 데이터 전송 완료',
        data: {
          id: 3,
          author: '블로그 이름',
          blogPlatform: '블로그 서비스 플랫폼',
          title: '피드 제목',
          path: 'https://test.com',
          createdAt: '2024-06-16T20:00:57.000Z',
          thumbnail: 'https://test.com/image.png',
          viewCount: 1,
          summary: '#example/n ### exexample',
          tag: ['tag1', 'tag2'],
          likes: 0,
          isLike: true,
        },
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
        message: '0번 피드는 존재하지 않습니다.',
      },
    }),
  );
}
