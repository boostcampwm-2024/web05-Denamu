import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { NoticeDetailDto } from '@notice/dto/response/notice.dto';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateNotice() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '공지사항 작성 API' }),
    ApiCreatedDataResponse(NoticeDetailDto, false, '공지사항 작성 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
