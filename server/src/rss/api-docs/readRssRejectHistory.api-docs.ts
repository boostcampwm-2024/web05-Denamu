import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { ReadRssRejectHistoryResponseDto } from '@rss/dto/response/readRssRejectHistory.dto';

export function ApiReadRssRejectHistory() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 거절 기록 API' }),
    ApiDataResponse(ReadRssRejectHistoryResponseDto, true, 'RSS 거절 기록 조회 성공'),
    ApiUnauthorizedDoc('유효한 사용자 세션이 존재하지 않는 경우'),
  );
}
