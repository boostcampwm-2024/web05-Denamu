import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { NoticeDetailDto } from '@notice/dto/response/notice.dto';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiUpdateNotice() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '공지사항 수정 API' }),
    ApiDataResponse(NoticeDetailDto, false, '공지사항 수정 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 공지사항입니다.'),
  );
}
