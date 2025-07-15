import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiRequestDeleteRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 취소 신청 API' }),
    ApiOkResponse({
      description: '취소 신청을 성공했을 경우',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: 'RSS 삭제 요청을 성공했습니다.',
      },
    }),
    ApiNotFoundResponse({
      description: 'RSS를 찾을 수 없을 경우',
      example: {
        message: 'RSS 데이터를 찾을 수 없습니다.',
      },
    }),
  );
}
