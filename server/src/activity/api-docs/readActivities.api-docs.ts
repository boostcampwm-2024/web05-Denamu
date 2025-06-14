import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

export function ApiReadActivities() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 활동 데이터 조회',
      description:
        '특정 연도의 사용자 일별 활동 데이터와 스트릭 정보를 조회합니다.',
    }),
    ApiOkResponse({
      description: '활동 데이터 조회 성공',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
            properties: {
              dailyActivities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: {
                      type: 'string',
                      description: '활동 날짜 (YYYY-MM-DD)',
                    },
                    viewCount: {
                      type: 'number',
                      description: '해당 날짜의 조회수',
                    },
                  },
                },
                description: '연도별 일별 활동 데이터 배열',
              },
              maxStreak: {
                type: 'number',
                description: '사용자의 최장 읽기 스트릭',
              },
              currentStreak: {
                type: 'number',
                description: '사용자의 현재 읽기 스트릭',
              },
              totalViews: {
                type: 'number',
                description: '사용자의 총 읽기 횟수',
              },
            },
          },
        },
      },
      example: {
        message: '요청이 성공적으로 처리되었습니다.',
        data: {
          dailyActivities: [
            {
              date: '2024-01-15',
              viewCount: 5,
            },
            {
              date: '2024-01-16',
              viewCount: 3,
            },
          ],
          maxStreak: 15,
          currentStreak: 7,
          totalViews: 120,
        },
      },
    }),
    ApiNotFoundResponse({
      description: '존재하지 않는 사용자',
      example: {
        message: '존재하지 않는 사용자입니다.',
      },
    }),
  );
}
