import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { QnaListResponseDto } from '@qna/dto/response/qna.dto';

export function ApiGetQnas() {
  return applyDecorators(
    ApiOperation({ summary: '문의 목록 조회 API' }),
    ApiDataResponse(QnaListResponseDto, false, '문의 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
