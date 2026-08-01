import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { GetChildAdminResponseDto } from '@admin/dto/response/getChildAdmin.dto';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetChildrenAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '내가 생성한 관리자 계정 목록 조회 API' }),
    ApiDataResponse(
      GetChildAdminResponseDto,
      true,
      '내가 생성한 관리자 계정 목록을 반환합니다.',
    ),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
