import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiDeleteComment() {
  return applyDecorators(
    ApiOperation({
      summary: '댓글 삭제 API',
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
        message: '댓글 삭제를 성공했습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
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
