import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiForbiddenDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateQnaMessage() {
  return applyDecorators(
    ApiOperation({
      summary: '추가 질문 등록 API',
      description:
        '답변 완료 상태(ANSWERED)인 문의에만 추가 질문을 등록할 수 있습니다. 등록 시 상태가 PENDING으로 되돌아갑니다.',
    }),
    ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 }),
    ApiMessageResponse('추가 질문 등록 성공'),
    ApiBadRequestDoc('답변 완료 후에만 추가 질문이 가능합니다.'),
    ApiUnauthorizedDoc(
      '존재하지 않는 문의이거나 비밀번호가 일치하지 않습니다.',
    ),
    ApiForbiddenDoc('작성자만 추가 질문을 등록할 수 있습니다.'),
    ApiNotFoundDoc('존재하지 않는 문의입니다.'),
  );
}
