import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiForbiddenDoc,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { GetOwnedRssFeedsResponseDto } from '@rss/dto/response/getOwnedRssFeeds.dto';

export function ApiGetOwnedRssFeeds() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '소유 RSS의 게시글 관리 목록 조회 API',
      description:
        '본인이 인증한 RSS의 게시글을 공개/비공개 상태와 함께 커서 기반으로 조회합니다. 비공개 게시글도 포함됩니다.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '게시글을 조회할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiDataResponse(GetOwnedRssFeedsResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiForbiddenDoc('본인이 인증한 RSS가 아닙니다.'),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
  );
}
