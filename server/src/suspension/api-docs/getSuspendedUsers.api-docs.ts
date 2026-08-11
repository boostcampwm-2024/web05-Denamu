import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { GetSuspendedUsersResponseDto } from '@suspension/dto/response/getSuspendedUsers.dto';

export function ApiGetSuspendedUsers() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 정지된 유저 목록 조회 API' }),
    ApiDataResponse(
      GetSuspendedUsersResponseDto,
      false,
      '정지된 유저 목록 조회 성공',
    ),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
