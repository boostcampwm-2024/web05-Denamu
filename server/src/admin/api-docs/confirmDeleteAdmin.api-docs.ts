import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiConfirmDeleteAdmin() {
  return applyDecorators(
    ApiOperation({ summary: '관리자 본인 회원탈퇴 인증 API' }),
    ApiParam({ name: 'token', description: '회원탈퇴 인증 토큰' }),
    ApiMessageResponse('회원탈퇴가 완료되었습니다.'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('유효하지 않거나 만료된 토큰입니다.'),
  );
}
