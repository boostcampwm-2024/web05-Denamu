import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse } from '@common/swagger/swagger.helper';
import { ReadRssResponseDto } from '@rss/dto/response/readRss.dto';

export function ApiReadAllRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 전체 조회 API' }),
    ApiDataResponse(ReadRssResponseDto, true, 'RSS 목록 조회 성공'),
  );
}
