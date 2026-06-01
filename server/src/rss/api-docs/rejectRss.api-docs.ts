import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { RejectRssRequestDto } from '@rss/dto/request/rejectRss';

export function ApiRejectRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 거부 API' }),
    ApiParam({ name: 'id', type: Number, description: '거절할 RSS의 ID', example: 1 }),
    ApiBody({ type: RejectRssRequestDto }),
    ApiCreatedDoc('RSS 거절 완료'),
    ApiUnauthorizedDoc('유효한 사용자 세션이 존재하지 않는 경우'),
    ApiNotFoundDoc('해당 ID의 RSS가 존재하지 않는 경우'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
