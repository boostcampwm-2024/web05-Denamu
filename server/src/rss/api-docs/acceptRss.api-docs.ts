import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiAcceptRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 승인 API' }),
    ApiParam({ name: 'id', type: Number, description: '승인할 RSS의 ID', example: 1 }),
    ApiCreatedDoc('RSS 승인 완료'),
    ApiUnauthorizedDoc('유효한 사용자 세션이 존재하지 않는 경우'),
    ApiNotFoundDoc('해당 ID의 RSS가 존재하지 않는 경우'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
