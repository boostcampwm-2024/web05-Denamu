import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { GetSessionAdminResponseDto } from '@admin/dto/response/getSessionAdmin.dto';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetSessionIdAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 페이지 출력을 위한 sessionId 확인 API' }),
    ApiDataResponse(
      GetSessionAdminResponseDto,
      false,
      '세션이 유효하며 관리자 이름을 반환합니다.',
    ),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
