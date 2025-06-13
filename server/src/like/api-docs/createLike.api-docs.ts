import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiCreateLike() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 좋아요 등록 API',
    }),
    ApiCreatedResponse({
      description: 'Created',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: '좋아요 등록을 성공했습니다.',
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
    ApiNotFoundResponse({
      description: '해당 ID의 게시글이 존재하지 않는 경우',
      example: {
        message: '존재하지 않는 게시글입니다.',
      },
    }),
  );
}
