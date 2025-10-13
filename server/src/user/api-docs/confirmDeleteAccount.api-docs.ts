import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiConfirmDeleteAccount() {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴 확정 API',
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
        message: '회원탈퇴가 완료되었습니다.',
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
        message: '유효하지 않거나 만료된 토큰입니다.',
      },
    }),
  );
}
