import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { DeleteRssRequestDto } from '@rss/dto/request/deleteRss.dto';

export function ApiDeleteRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 취소 신청 API' }),
    ApiBody({ type: DeleteRssRequestDto }),
    ApiMessageResponse('RSS 삭제 신청 완료'),
    ApiNotFoundDoc('RSS를 찾을 수 없을 경우'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
