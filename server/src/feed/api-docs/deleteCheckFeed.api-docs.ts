import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiDeleteCheckFeed() {
  return applyDecorators(
    ApiOperation({
      summary: '게시글 삭제 확인 API',
    }),
    ApiOkResponse({
      description: '게시글이 존재할 경우 200 OK',
      example: {
        message: '게시글 삭제 확인 요청을 성공했습니다.',
      },
    }),
    ApiNotFoundResponse({
      description: '게시글이 삭제된 경우 404 Not Found',
      example: {
        message: '원본 게시글이 삭제되었습니다.',
      },
    }),
  );
}
