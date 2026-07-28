import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { NoticeListResponseDto } from '@notice/dto/response/notice.dto';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

export function ApiGetNotices() {
  return applyDecorators(
    ApiOperation({ summary: '공지사항 목록 조회 API' }),
    ApiDataResponse(NoticeListResponseDto, false, '공지사항 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
