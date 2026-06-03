import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { LoginAdminRequestDto } from '@admin/dto/request/loginAdmin.dto';

export function ApiLoginAdmin() {
  return applyDecorators(
    ApiOperation({ summary: '관리자 로그인 API' }),
    ApiBody({ type: LoginAdminRequestDto }),
    ApiMessageResponse('로그인 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('아이디 혹은 비밀번호가 잘못되었습니다.'),
  );
}
