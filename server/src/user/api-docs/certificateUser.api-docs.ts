import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiCertificateUser() {
  return applyDecorators(
    ApiOperation({
      summary: '회원 인증 API',
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
        message: '회원 인증 요청이 성공적으로 처리되었습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      example: {
        message: '인증에 실패했습니다.',
      },
    }),
  );
}
