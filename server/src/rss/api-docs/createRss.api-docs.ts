import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';

export function ApiCreateRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 등록 API' }),
    ApiBody({ type: RegisterRssRequestDto }),
    ApiCreatedDoc('RSS 등록 신청 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했거나 blogUrl/rssUrl에 접근할 수 없습니다.'),
    ApiConflictDoc('이미 등록된 RSS URL입니다.'),
    ApiNotFoundDoc('blogUrl 또는 rssUrl에서 페이지를 찾을 수 없습니다(404).'),
  );
}
