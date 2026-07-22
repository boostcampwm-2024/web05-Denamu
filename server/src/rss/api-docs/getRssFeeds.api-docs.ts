import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { GetRssFeedsResponseDto } from '@rss/dto/response/getRssFeeds.dto';

export function ApiGetRssFeeds() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 공개 게시글 목록 조회 API',
      description:
        '특정 RSS의 공개 게시글을 커서 기반으로 조회합니다. 썸네일, 제목, 작성일, 좋아요 수, 댓글 수를 포함합니다.',
    }),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '게시글을 조회할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiDataResponse(GetRssFeedsResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
  );
}
