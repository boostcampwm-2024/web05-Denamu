import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetSessionIdAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 페이지 출력을 위한 sessionId 확인 API' }),
    ApiMessageResponse('세션이 유효합니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
