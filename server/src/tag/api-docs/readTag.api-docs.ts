import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse } from '@common/swagger/swagger.helper';

import { ReadTagResponseDto } from '@tag/dto/response/readTag.dto';

export function ApiReadTags() {
  return applyDecorators(
    ApiOperation({ summary: '카테고리별 태그 목록 조회 API' }),
    ApiDataResponse(ReadTagResponseDto, true, '카테고리별 태그 목록 조회 성공'),
  );
}
