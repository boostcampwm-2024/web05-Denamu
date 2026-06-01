import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';

export function ApiUpdateComment() {
  return applyDecorators(
    ApiOperation({ summary: '댓글 수정 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'feedId', type: Number, description: '게시글 ID', example: 1 }),
    ApiParam({ name: 'commentId', type: Number, description: '댓글 ID', example: 1 }),
    ApiBody({ type: UpdateCommentRequestDto }),
    ApiMessageResponse('댓글 수정 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 댓글입니다.'),
  );
}
