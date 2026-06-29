import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { ChangePasswordRequestDto } from '@user/dto/request/changePassword.dto';

export function ApiChangePassword() {
  return applyDecorators(
    ApiOperation({
      summary: '비밀번호 설정/변경 API',
      description:
        '로그인한 사용자의 비밀번호를 변경합니다. 비밀번호가 설정된 계정은 현재 비밀번호 검증이 필요하고, 소셜 전용 계정은 현재 비밀번호 없이 새 비밀번호를 설정합니다.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: ChangePasswordRequestDto }),
    ApiMessageResponse('비밀번호 변경 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('현재 비밀번호가 일치하지 않거나 로그인이 필요합니다.'),
  );
}
