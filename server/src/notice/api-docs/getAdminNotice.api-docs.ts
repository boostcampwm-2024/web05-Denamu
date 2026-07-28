import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { NoticeDetailDto } from '@notice/dto/response/notice.dto';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetAdminNotice() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 공지사항 상세 조회 API' }),
    ApiDataResponse(NoticeDetailDto, false, '공지사항 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 공지사항입니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
