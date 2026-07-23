import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { GetBlockedUsersResponseDto } from '@block/dto/response/getBlockedUsers.dto';

export function ApiGetBlockedUsers() {
  return applyDecorators(
    ApiOperation({ summary: '차단한 사용자 목록 조회 API' }),
    ApiBearerAuth(),
    ApiDataResponse(GetBlockedUsersResponseDto, true, '차단 목록 조회 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
