import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { UpdateUserSuspensionRequestDto } from '@suspension/dto/request/updateUserSuspension.dto';

export function ApiUpdateUserSuspension() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 유저 정지 정보 수정(해제 포함) API' }),
    ApiParam({ name: 'userId', description: '정지 대상 유저 ID', example: 1 }),
    ApiBody({ type: UpdateUserSuspensionRequestDto }),
    ApiMessageResponse('유저 정지 정보 수정 완료'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 유저이거나 활성 정지 내역이 없는 경우'),
    ApiBadRequestDoc('요청 데이터 검증에 실패한 경우'),
  );
}
