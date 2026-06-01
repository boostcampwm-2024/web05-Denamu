import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { CheckEmailDuplicationResponseDto } from '@user/dto/response/checkEmailDuplication.dto';

export function ApiCheckEmailDuplication() {
  return applyDecorators(
    ApiOperation({ summary: '이메일 중복 조회 API' }),
    ApiQuery({ name: 'email', type: String, description: '중복 확인할 이메일', example: 'test@test.com' }),
    ApiDataResponse(CheckEmailDuplicationResponseDto, false, '이메일 중복 여부 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 사용자입니다.'),
  );
}
