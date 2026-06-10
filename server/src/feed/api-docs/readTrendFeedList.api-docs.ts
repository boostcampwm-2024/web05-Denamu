import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';

import { FeedTrendResponseDto } from '@feed/dto/response/readFeedPagination.dto';

export function ApiReadTrendFeedList() {
  return applyDecorators(
    ApiOperation({ summary: '트렌드 게시글 조회 SSE' }),
    ApiExtraModels(FeedTrendResponseDto),
    ApiOkResponse({
      description: 'SSE Stream',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(FeedTrendResponseDto) },
          },
        },
      },
      examples: {
        connect: {
          summary: '현재 트렌드 피드 수신 완료',
          value: {
            message: '현재 트렌드 피드 수신 완료',
            data: [
              {
                id: 1,
                author: '블로그 이름',
                blogPlatform: '블로그 서비스 플랫폼',
                title: '피드 제목',
                path: 'https://test1.com/1',
                createdAt: '2024-11-24T01:00:00.000Z',
                thumbnail: 'https://test1.com/test.png',
                viewCount: 0,
                tag: ['tag1', 'tag2'],
                likes: 0,
                comments: 0,
              },
              {
                id: 2,
                author: '블로그 이름',
                blogPlatform: '블로그 서비스 플랫폼',
                title: '피드 제목',
                path: 'https://test2.com/1',
                createdAt: '2024-11-24T02:00:00.000Z',
                thumbnail: 'https://test2.com/test.png',
                viewCount: 0,
                tag: ['tag1', 'tag2'],
                likes: 0,
                comments: 0,
              },
            ],
          },
        },
        continue: {
          summary: '새로운 트렌드 피드 수신 완료',
          value: {
            message: '새로운 트렌드 피드 수신 완료',
            data: [
              {
                id: 3,
                author: '블로그 이름',
                blogPlatform: '블로그 서비스 플랫폼',
                title: '피드 제목',
                path: 'https://test3.com/1',
                createdAt: '2024-11-24T03:00:00.000Z',
                thumbnail: 'https://test3.com/test.png',
                viewCount: 0,
                tag: ['tag1', 'tag2'],
                likes: 0,
                comments: 0,
              },
              {
                id: 4,
                author: '블로그 이름',
                blogPlatform: '블로그 서비스 플랫폼',
                title: '피드 제목',
                path: 'https://test4.com/1',
                createdAt: '2024-11-24T04:00:00.000Z',
                thumbnail: 'https://test4.com/test.png',
                viewCount: 0,
                tag: ['tag1', 'tag2'],
                likes: 0,
                comments: 0,
              },
            ],
          },
        },
      },
    }),
  );
}
