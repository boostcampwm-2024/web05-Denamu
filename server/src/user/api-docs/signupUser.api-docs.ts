import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiSignupUser() {
  return applyDecorators(
    ApiOperation({
      summary: '회원 가입 API',
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
        message: '회원가입이 요청이 성공적으로 처리되었습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
    ApiConflictResponse({
      description: 'Conflict',
      example: {
        message: '이미 존재하는 이메일입니다.',
      },
    }),
  );
}
