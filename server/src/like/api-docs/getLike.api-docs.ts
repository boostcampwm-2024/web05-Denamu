import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiGetLike() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 좋아요 조회 API',
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
              isLike: {
                type: 'boolean',
              },
            },
          },
        },
      },
      example: {
        message: '좋아요 조회를 성공했습니다.',
        data: {
          isLike: false,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
    ApiNotFoundResponse({
      description: '해당 ID의 게시글이 존재하지 않는 경우',
      example: {
        message: '해당 피드를 찾을 수 없습니다.',
      },
    }),
  );
}
