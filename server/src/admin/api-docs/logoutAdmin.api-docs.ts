import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiLogoutAdmin() {
  return applyDecorators(
    ApiOperation({
      summary: '관리자 로그아웃 API',
    }),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: '로그아웃이 성공적으로 처리되었습니다.',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      example: {
        message: '인증되지 않은 요청입니다.',
      },
    }),
  );
}
