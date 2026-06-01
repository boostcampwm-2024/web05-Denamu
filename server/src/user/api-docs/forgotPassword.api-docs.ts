import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import { ApiMessageResponse } from '@common/swagger/swagger.helper';
import { ForgotPasswordRequestDto } from '@user/dto/request/forgotPassword.dto';

export function ApiForgotPassword() {
  return applyDecorators(
    ApiOperation({ summary: '비밀번호 변경 요청 API' }),
    ApiBody({ type: ForgotPasswordRequestDto }),
    ApiMessageResponse('비밀번호 재설정 이메일 발송 완료'),
  );
}
