import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import {
  ApiBadGatewayDoc,
  ApiBadRequestDoc,
} from '@common/swagger/swagger.helper';

export function ApiOAuthCallback() {
  return applyDecorators(
    ApiOperation({ summary: 'OAuth 콜백 처리 API' }),
    ApiResponse({ status: 302, description: '인증 처리 후 메인 페이지 리디렉션' }),
    ApiBadGatewayDoc('현재 외부 서비스와의 연결에 실패했습니다.'),
    ApiBadRequestDoc('잘못된 state 형식입니다.'),
  );
}
