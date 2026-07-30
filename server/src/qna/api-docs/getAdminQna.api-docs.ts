import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { QnaDetailDto } from '@qna/dto/response/qna.dto';

export function ApiGetAdminQna() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({
      summary: '관리자 문의 상세 조회 API',
      description: '관리자는 비밀번호 없이 전체 스레드를 조회할 수 있습니다.',
    }),
    ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 }),
    ApiDataResponse(QnaDetailDto, false, '문의 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 문의입니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
