import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { ReadRssAcceptHistoryResponseDto } from '@rss/dto/response/readRssAcceptHistory.dto';

export function ApiReadRssAcceptHistory() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: 'RSS 승인 기록 API' }),
    ApiDataResponse(ReadRssAcceptHistoryResponseDto, true, 'RSS 승인 기록 조회 성공'),
    ApiUnauthorizedDoc('유효한 사용자 세션이 존재하지 않는 경우'),
  );
}
