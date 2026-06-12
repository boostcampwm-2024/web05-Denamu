import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import { ApiBadRequestDoc, ApiDataResponse } from '@common/swagger/swagger.helper';
import { CheckEmailDuplicationResponseDto } from '@user/dto/response/checkEmailDuplication.dto';

export function ApiCheckNameDuplication() {
  return applyDecorators(
    ApiOperation({ summary: '닉네임 중복 조회 API' }),
    ApiQuery({ name: 'userName', type: String, description: '중복 확인할 닉네임', example: '홍길동' }),
    ApiDataResponse(CheckEmailDuplicationResponseDto, false, '닉네임 중복 여부 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
