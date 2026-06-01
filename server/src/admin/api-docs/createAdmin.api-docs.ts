import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';

export function ApiCreateAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 회원 가입 API' }),
    ApiBody({ type: RegisterAdminRequestDto }),
    ApiCreatedDoc('관리자 계정 생성 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiConflictDoc('이미 존재하는 계정입니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
