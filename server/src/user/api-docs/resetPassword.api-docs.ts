import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { ResetPasswordRequestDto } from '@user/dto/request/resetPassword.dto';

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({ summary: '비밀번호 변경 API' }),
    ApiParam({ name: 'uuid', type: String, description: '비밀번호 재설정 인증 코드', example: 'd2ba0d98-95ce-4905-87fc-384965ffe7c9' }),
    ApiBody({ type: ResetPasswordRequestDto }),
    ApiMessageResponse('비밀번호 변경 완료'),
    ApiNotFoundDoc('인증에 실패했습니다.'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
