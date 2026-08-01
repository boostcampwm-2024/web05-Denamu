import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { QnaDetailDto } from '@qna/dto/response/qna.dto';

export function ApiVerifyQna() {
  return applyDecorators(
    ApiOperation({ summary: '비공개 문의 비밀번호 확인 API' }),
    ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 }),
    ApiDataResponse(QnaDetailDto, false, '비밀번호 확인 성공'),
    ApiUnauthorizedDoc(
      '존재하지 않는 문의이거나 비밀번호가 일치하지 않습니다.',
    ),
  );
}
