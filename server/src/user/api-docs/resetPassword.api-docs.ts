import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { ResetPasswordRequestDto } from '@user/dto/request/resetPassword.dto';

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({ summary: '비밀번호 변경 API' }),
    ApiBody({ type: ResetPasswordRequestDto }),
    ApiMessageResponse('비밀번호 변경 완료'),
    ApiNotFoundDoc('인증에 실패했습니다.'),
  );
}
