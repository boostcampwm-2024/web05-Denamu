import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateUserBlock() {
  return applyDecorators(
    ApiOperation({ summary: '사용자 차단 등록 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'userId',
      type: Number,
      description: '차단할 사용자 ID',
      example: 1,
    }),
    ApiCreatedDoc('사용자 차단 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했거나 자기 자신을 차단한 경우'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('해당 ID의 사용자가 존재하지 않는 경우'),
    ApiConflictDoc('이미 차단한 사용자인 경우'),
  );
}
