import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiConfirmDeleteAccount() {
  return applyDecorators(
    ApiOperation({ summary: '회원탈퇴 확정 API' }),
    ApiParam({ name: 'token', type: String, description: '회원탈퇴 인증 토큰', example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9' }),
    ApiMessageResponse('회원탈퇴 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('유효하지 않거나 만료된 토큰입니다.'),
  );
}
