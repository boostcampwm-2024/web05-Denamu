import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse } from '@common/swagger/swagger.helper';
import { ReadFeedRecentResponseDto } from '@feed/dto/response/readFeedRecent.dto';

export function ApiReadRecentFeedList() {
  return applyDecorators(
    ApiOperation({ summary: '최신 피드 업데이트 API' }),
    ApiDataResponse(ReadFeedRecentResponseDto, true, '최신 피드 목록 조회 성공'),
  );
}
