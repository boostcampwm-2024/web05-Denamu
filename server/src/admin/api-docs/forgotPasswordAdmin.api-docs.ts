import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
} from '@common/swagger/swagger.helper';

import { ForgotPasswordAdminRequestDto } from '@admin/dto/request/forgotPasswordAdmin.dto';

export function ApiForgotPasswordAdmin() {
  return applyDecorators(
    ApiOperation({ summary: '관리자 비밀번호 변경 요청 API' }),
    ApiBody({ type: ForgotPasswordAdminRequestDto }),
    ApiMessageResponse('비밀번호 재설정 이메일 발송 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
