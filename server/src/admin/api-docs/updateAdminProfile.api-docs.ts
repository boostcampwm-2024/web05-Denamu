import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiConflictDoc,
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiUpdateAdminProfile() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({
      summary: '관리자 본인 정보 수정 API',
      description:
        '이름, 비밀번호, 이메일 수신 여부를 수정합니다. 이메일은 변경할 수 없습니다.',
    }),
    ApiMessageResponse('관리자 정보가 성공적으로 수정되었습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiConflictDoc('이미 존재하는 이름입니다.'),
  );
}
