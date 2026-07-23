import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteBlock() {
  return applyDecorators(
    ApiOperation({ summary: '사용자 차단 해제 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'userId',
      type: Number,
      description: '차단 해제할 사용자 ID',
      example: 1,
    }),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('차단하지 않은 사용자인 경우'),
  );
}
