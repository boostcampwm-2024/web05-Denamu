import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteBoard() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '게시글 삭제 API' }),
    ApiMessageResponse('게시글 삭제 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 게시글입니다.'),
  );
}
