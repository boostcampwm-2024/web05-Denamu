import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';

export function ApiCreateComment() {
  return applyDecorators(
    ApiOperation({ summary: '댓글 등록 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'feedId', type: Number, description: '게시글 ID', example: 1 }),
    ApiBody({ type: CreateCommentRequestDto }),
    ApiCreatedDoc('댓글 등록 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 사용자입니다.'),
  );
}
