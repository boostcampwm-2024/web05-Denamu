import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiForbiddenDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateSubscription() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 구독 등록 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'rssId', type: Number, description: 'RSS ID', example: 1 }),
    ApiCreatedDoc('구독 등록 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiForbiddenDoc('본인 소유 블로그는 구독할 수 없는 경우'),
    ApiNotFoundDoc('해당 ID의 RSS가 존재하지 않는 경우'),
    ApiConflictDoc('이미 구독한 경우'),
  );
}
