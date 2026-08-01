import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { ApiDataResponse, ApiNotFoundDoc } from '@common/swagger/swagger.helper';

import { GetRssInfoResponseDto } from '@rss/dto/response/getRssInfo.dto';

export function ApiGetRssInfo() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 정보 조회 API',
      description:
        '특정 RSS의 정보(이름, 플랫폼, 게시글 수, 구독자 수, 최근 게시글 발행일, 소유자 정보)를 조회합니다. 비로그인도 조회 가능하며, 로그인 시 구독 여부와 소유 여부를 함께 반환합니다.',
    }),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '조회할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiDataResponse(GetRssInfoResponseDto),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
  );
}
