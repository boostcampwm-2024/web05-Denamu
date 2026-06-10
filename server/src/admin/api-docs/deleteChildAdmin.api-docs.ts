import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiForbiddenDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteChildAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '내가 생성한 관리자 계정 삭제 API' }),
    ApiParam({ name: 'id', description: '삭제할 관리자 계정 ID', example: 1 }),
    ApiMessageResponse('관리자 계정이 성공적으로 삭제되었습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiForbiddenDoc('본인이 생성한 관리자 계정만 삭제할 수 있습니다.'),
    ApiNotFoundDoc('존재하지 않는 관리자 계정입니다.'),
  );
}
