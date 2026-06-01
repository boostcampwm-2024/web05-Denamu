import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteLike() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 좋아요 취소 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'feedId', type: Number, description: '게시글 ID', example: 1 }),
    ApiMessageResponse('좋아요 취소 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('해당 ID의 게시글이 존재하지 않는 경우'),
  );
}
