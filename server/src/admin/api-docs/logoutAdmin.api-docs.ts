import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiLogoutAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 로그아웃 API' }),
    ApiMessageResponse('로그아웃 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
