import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteUserSuspension() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 유저 정지 내역 무효(삭제) 처리 API' }),
    ApiParam({ name: 'userId', description: '정지 대상 유저 ID', example: 1 }),
    ApiMessageResponse('유저 정지 내역 삭제 완료'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 유저이거나 활성 정지 내역이 없는 경우'),
  );
}
