import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteCheckFeed() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 삭제 확인 API' }),
    ApiMessageResponse('게시글 삭제 확인 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('게시글이 삭제된 경우 404 Not Found'),
  );
}
