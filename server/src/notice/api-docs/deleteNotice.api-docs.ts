import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteNotice() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '공지사항 삭제 API' }),
    ApiMessageResponse('공지사항 삭제 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 공지사항입니다.'),
  );
}
