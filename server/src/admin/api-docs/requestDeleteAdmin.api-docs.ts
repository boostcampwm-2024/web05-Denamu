import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiRequestDeleteAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 본인 회원탈퇴 요청 API' }),
    ApiMessageResponse(
      '회원탈퇴 신청이 성공적으로 처리되었습니다. 이메일을 확인해주세요.',
    ),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 관리자 계정입니다.'),
  );
}
