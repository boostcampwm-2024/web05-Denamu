import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { QnaDetailDto } from '@qna/dto/response/qna.dto';

export function ApiGetQna() {
  return applyDecorators(
    ApiOperation({
      summary: '문의 상세 조회 API',
      description:
        '비공개 문의는 본문/스레드 없이 { id, title, isSecret: true, requiresPassword: true }만 반환합니다.',
    }),
    ApiParam({ name: 'id', type: Number, description: '문의 ID', example: 1 }),
    ApiDataResponse(QnaDetailDto, false, '문의 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 문의입니다.'),
  );
}
