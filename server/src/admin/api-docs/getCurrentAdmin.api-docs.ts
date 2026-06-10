import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { GetAdminProfileResponseDto } from '@admin/dto/response/getAdminProfile.dto';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetCurrentAdmin() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '현재 로그인한 관리자 프로필 조회 API' }),
    ApiDataResponse(
      GetAdminProfileResponseDto,
      false,
      '관리자 이름과 부모 계정 정보를 반환합니다.',
    ),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
