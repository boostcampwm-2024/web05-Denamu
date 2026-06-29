import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteSubscription() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 구독 해제 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'rssId', type: Number, description: 'RSS ID', example: 1 }),
    ApiMessageResponse('구독 해제 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('구독하지 않은 RSS인 경우'),
  );
}
