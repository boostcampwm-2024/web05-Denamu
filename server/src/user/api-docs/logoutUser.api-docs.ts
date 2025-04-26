import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiLogoutUser() {
  return applyDecorators(
    ApiOperation({
      summary: '회원 로그아웃 API',
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
        message: '로그아웃을 성공했습니다.',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: 'Unauthorized',
      },
    }),
  );
}
