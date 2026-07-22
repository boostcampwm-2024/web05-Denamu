import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ReadActivityResponseDto } from '@activity/dto/response/readActivity.dto';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetRssActivities() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 게시글 발행 활동(잔디) 조회 API',
      description:
        '특정 RSS의 공개 게시글 발행 활동을 특정 연도 기준 일별 건수로 조회합니다. (viewCount = 해당 날짜 발행 게시글 수)',
    }),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '조회할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: Number,
      description: '조회할 연도',
      example: 2025,
    }),
    ApiDataResponse(ReadActivityResponseDto, false, 'RSS 발행 활동 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
  );
}
