import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiRejectReport() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({
      summary: '관리자 신고 거절 API',
      description: '신고를 거절하고 해당 신고 데이터를 즉시 삭제합니다.',
    }),
    ApiParam({ name: 'id', type: Number, description: '거절할 신고의 ID', example: 1 }),
    ApiMessageResponse('신고 거절 완료'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('해당 ID의 신고가 존재하지 않는 경우'),
  );
}
