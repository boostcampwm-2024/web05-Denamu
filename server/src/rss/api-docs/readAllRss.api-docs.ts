import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse, ApiUnauthorizedDoc } from '@common/swagger/swagger.helper';
import { ReadRssResponseDto } from '@rss/dto/response/readRss.dto';

export function ApiReadAllRss() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: 'RSS 전체 조회 API' }),
    ApiDataResponse(ReadRssResponseDto, true, 'RSS 목록 조회 성공'),
    ApiUnauthorizedDoc('유효한 사용자 세션이 존재하지 않는 경우'),
  );
}
