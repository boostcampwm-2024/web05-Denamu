import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';
import { SearchType } from '@feed/dto/request/searchFeed.dto';
import { SearchFeedResponseDto } from '@feed/dto/response/searchFeed.dto';

export function ApiSearchFeedList() {
  return applyDecorators(
    ApiOperation({ summary: '검색 API' }),
    ApiQuery({
      name: 'find',
      required: true,
      type: String,
      description: '검색어',
      example: 'test',
    }),
    ApiQuery({
      name: 'type',
      required: true,
      enum: SearchType,
      description: '검색 타입',
      example: SearchType.ALL,
    }),
    ApiQuery({
      name: 'page',
      required: true,
      type: Number,
      description: '페이지 번호',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: true,
      type: Number,
      description: '한 페이지에 보여줄 개수',
      example: 4,
    }),
    ApiDataResponse(SearchFeedResponseDto, false, '검색 결과 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
