import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteCommentByAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 댓글 삭제 API' }),
    ApiParam({ name: 'commentId', description: '삭제할 댓글 ID', example: 1 }),
    ApiMessageResponse('댓글이 성공적으로 삭제되었습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 댓글입니다.'),
  );
}
