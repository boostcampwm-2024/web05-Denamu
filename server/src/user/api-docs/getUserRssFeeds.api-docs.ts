import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { GetUserRssFeedsResponseDto } from '@user/dto/response/getUserRssFeeds.dto';

export function ApiGetUserRssFeeds() {
  return applyDecorators(
    ApiOperation({
      summary: '특정 RSS의 게시글 목록 조회 API',
      description:
        '특정 RSS(rss_accept)에 등록된 게시글 목록을 작성일, 댓글 수와 함께 커서 기반으로 조회합니다.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'RSS 소유자 사용자 ID',
      example: 1,
    }),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '게시글을 조회할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiDataResponse(GetUserRssFeedsResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
