import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiLogoutUser() {
  return applyDecorators(
    ApiOperation({ summary: '회원 로그아웃 API' }),
    ApiBearerAuth(),
    ApiMessageResponse('로그아웃 성공'),
    ApiUnauthorizedDoc('로그인이 필요합니다.'),
  );
}
