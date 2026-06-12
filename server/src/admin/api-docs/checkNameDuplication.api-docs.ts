import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { CheckNameDuplicationResponseDto } from '@admin/dto/response/checkNameDuplication.dto';

export function ApiCheckNameDuplication() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 이름 중복 조회 API' }),
    ApiQuery({ name: 'name', type: String, description: '중복 확인할 관리자 이름', example: '홍길동' }),
    ApiDataResponse(CheckNameDuplicationResponseDto, false, '이름 중복 여부 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
