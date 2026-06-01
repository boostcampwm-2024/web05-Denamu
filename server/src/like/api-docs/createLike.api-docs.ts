import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateLike() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 좋아요 등록 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'feedId', type: Number, description: '게시글 ID', example: 1 }),
    ApiCreatedDoc('좋아요 등록 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('해당 ID의 게시글이 존재하지 않는 경우'),
    ApiConflictDoc('이미 좋아요를 누른 경우'),
  );
}
