import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { GetBlockedRssResponseDto } from '@block/dto/response/getBlockedRss.dto';

export function ApiGetBlockedRss() {
  return applyDecorators(
    ApiOperation({ summary: '차단한 RSS 목록 조회 API' }),
    ApiBearerAuth(),
    ApiDataResponse(GetBlockedRssResponseDto, true, 'RSS 차단 목록 조회 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
