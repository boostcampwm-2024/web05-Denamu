import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';
import { ReadFeedPaginationResponseDto } from '@feed/dto/response/readFeedPagination.dto';

export function ApiReadFeedPagination() {
  return applyDecorators(
    ApiOperation({ summary: '메인 화면 게시글 조회 API' }),
    ApiQuery({
      name: 'lastId',
      required: false,
      type: Number,
      description: '마지막으로 받은 피드의 ID',
      example: 10,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '한 번에 가져올 피드 수',
      example: 5,
      default: 12,
    }),
    ApiQuery({
      name: 'tags',
      required: false,
      type: Array,
      description: '태그 이름 목록',
      example: '',
    }),
    ApiDataResponse(ReadFeedPaginationResponseDto, false, '피드 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
