import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { RegisterAdminRequestDto } from '@admin/dto/request/registerAdmin.dto';

export function ApiRegisterAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 회원 가입 요청 API (이메일 인증 메일 발송)' }),
    ApiBody({ type: RegisterAdminRequestDto }),
    ApiCreatedDoc('관리자 계정 생성 요청 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiConflictDoc('이미 존재하는 계정입니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
