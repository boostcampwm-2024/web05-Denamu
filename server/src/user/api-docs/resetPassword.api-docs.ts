import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호 변경 API',
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
        message: '비밀번호가 성공적으로 수정되었습니다.',
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
