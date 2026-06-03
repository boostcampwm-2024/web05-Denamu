import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { GetCommentResponseDto } from '@comment/dto/response/getComment.dto';

export function ApiGetComment() {
  return applyDecorators(
    ApiOperation({ summary: '댓글 조회 API' }),
    ApiParam({ name: 'feedId', type: Number, description: '게시글 ID', example: 1 }),
    ApiDataResponse(GetCommentResponseDto, true, '댓글 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('게시글을 찾을 수 없습니다.'),
  );
}
