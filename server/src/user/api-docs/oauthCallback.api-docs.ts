import { applyDecorators } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export function ApiOAuthCallback() {
  return applyDecorators(
    ApiOperation({
      summary: 'OAuth 콜백 처리 API',
    }),
    ApiResponse({
      status: 302,
      description: '인증 처리 후 메인 페이지 리디렉션',
    }),
    ApiBadGatewayResponse({
      description: 'Bad Gateway',
      example: {
        message: '현재 외부 서비스와의 연결에 실패했습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '잘못된 state 형식입니다.',
      },
    }),
  );
}
