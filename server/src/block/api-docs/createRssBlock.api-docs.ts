import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateRssBlock() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 차단 등록 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '차단할 RSS ID',
      example: 1,
    }),
    ApiCreatedDoc('RSS 차단 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패한 경우'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('해당 ID의 RSS가 존재하지 않는 경우'),
    ApiConflictDoc('이미 차단한 RSS인 경우'),
  );
}
