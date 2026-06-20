import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';
import { CheckUserNameDuplicationResponseDto } from '@user/dto/response/checkUserNameDuplication.dto';

export function ApiCheckUserNameDuplication() {
  return applyDecorators(
    ApiOperation({ summary: '사용자 이름 중복 조회 API' }),
    ApiQuery({
      name: 'userName',
      type: String,
      description: '중복 확인할 사용자 이름',
      example: '홍길동',
    }),
    ApiDataResponse(
      CheckUserNameDuplicationResponseDto,
      false,
      '사용자 이름 중복 여부 조회 성공',
    ),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
