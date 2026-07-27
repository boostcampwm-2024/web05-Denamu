import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { OAuthRegistrationRequestDto } from '@user/dto/request/oAuthRegistration.dto';

export function ApiOAuthRegistration() {
  return applyDecorators(
    ApiOperation({
      summary: 'OAuth 신규 회원가입 완료 API (닉네임 입력, 이메일 수신 동의)',
    }),
    ApiBody({ type: OAuthRegistrationRequestDto }),
    ApiResponse({ status: 201, description: '회원가입 완료 및 로그인 처리' }),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiConflictDoc('이미 존재하는 닉네임입니다.'),
    ApiNotFoundDoc('유효하지 않거나 만료된 가입 요청입니다.'),
  );
}
