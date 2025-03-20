import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiLoginUser() {
  return applyDecorators(
    ApiOperation({
      summary: '회원 로그인 API',
    }),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
            },
          },
        },
      },
      example: {
        message: '로그인을 성공했습니다.',
        data: {
          accessToken: 'exampleJWT',
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
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
        message: '아이디 혹은 비밀번호가 잘못되었습니다.',
      },
    }),
  );
}
