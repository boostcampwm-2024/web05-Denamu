import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { CreateUserSuspensionRequestDto } from '@suspension/dto/request/createUserSuspension.dto';

export function ApiCreateUserSuspension() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 유저 정지 API' }),
    ApiBody({ type: CreateUserSuspensionRequestDto }),
    ApiCreatedDoc('유저 정지 처리 완료'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 유저인 경우'),
    ApiBadRequestDoc(
      '요청 데이터 검증에 실패했거나 정지 종료 일시가 과거인 경우',
    ),
  );
}
