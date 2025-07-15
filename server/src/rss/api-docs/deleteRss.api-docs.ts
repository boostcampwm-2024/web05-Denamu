import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiDeleteRss() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 삭제 인증 API',
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      example: {
        message: 'RSS 삭제 요청을 찾을 수 없습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
    ApiOkResponse({
      description: 'Ok',
      example: {
        message: 'RSS 삭제를 성공했습니다.',
      },
    }),
  );
}
