import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { GetLikeResponseDto } from '@like/dto/response/getLike.dto';

export function ApiGetLike() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 좋아요 조회 API' }),
    ApiParam({ name: 'feedId', type: Number, description: '게시글 ID', example: 1 }),
    ApiDataResponse(GetLikeResponseDto, false, '좋아요 상태 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('해당 ID의 게시글이 존재하지 않는 경우'),
  );
}
