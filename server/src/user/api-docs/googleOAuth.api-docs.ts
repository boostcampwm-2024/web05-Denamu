import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGoogleOAuth() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth 로그인 리디렉션 API',
    }),
    ApiResponse({
      status: 302,
      description: 'Google OAuth 로그인 페이지 리디렉션',
    }),
  );
}
