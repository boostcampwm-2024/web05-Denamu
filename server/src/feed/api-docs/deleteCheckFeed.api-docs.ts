import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteCheckFeed() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 삭제 확인 API' }),
    ApiMessageResponse('게시글 삭제 확인 완료'),
    ApiNotFoundDoc('게시글이 삭제된 경우 404 Not Found'),
  );
}
