import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
} from '@common/swagger/swagger.helper';
import { RegisterUserRequestDto } from '@user/dto/request/registerUser.dto';

export function ApiRegisterUser() {
  return applyDecorators(
    ApiOperation({ summary: '회원 가입 API' }),
    ApiBody({ type: RegisterUserRequestDto }),
    ApiCreatedDoc('회원가입 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiConflictDoc('이미 존재하는 이메일입니다.'),
  );
}
