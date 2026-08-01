import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateQnaAnswer() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({
      summary: '문의 답변 등록 API',
      description:
        '답변 등록 시 문의 상태가 ANSWERED로 변경되고, 작성자에게 답변 완료 이메일이 발송됩니다.',
    }),
    ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 }),
    ApiMessageResponse('답변 등록 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 문의입니다.'),
  );
}
