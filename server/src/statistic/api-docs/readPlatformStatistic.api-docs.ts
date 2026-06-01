import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse } from '@common/swagger/swagger.helper';
import { ReadStatisticPlatformResponseDto } from '@statistic/dto/response/readStatisticPlatform.dto';

export function ApiReadPlatformStatistic() {
  return applyDecorators(
    ApiOperation({ summary: '블로그 플랫폼 통계 조회 API' }),
    ApiDataResponse(ReadStatisticPlatformResponseDto, true, '블로그 플랫폼 통계 조회 성공'),
  );
}
