import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiRequestPasswordReset() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호 변경 요청 API',
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
        message: '비밀번호 재설정 링크를 이메일로 발송했습니다.',
      },
    }),
  );
}
