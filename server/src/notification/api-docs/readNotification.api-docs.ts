import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { ApiBadRequestDoc, ApiMessageResponse, ApiNotFoundDoc, ApiUnauthorizedDoc } from '@common/swagger/swagger.helper';

export function ApiReadNotification() {
  return applyDecorators(
    ApiOperation({ summary: '알림 읽음 처리 API' }),
    ApiBearerAuth(),
    ApiParam({ name: 'notificationId', type: Number, description: '알림 ID', example: 1 }),
    ApiMessageResponse('알림 읽음 처리 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않거나 본인 소유가 아닌 알림인 경우'),
  );
}
