import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { NoticeDetailDto } from '@notice/dto/response/notice.dto';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetNotice() {
  return applyDecorators(
    ApiOperation({ summary: '공지사항 상세 조회 API' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '공지사항 ID',
      example: 1,
    }),
    ApiDataResponse(NoticeDetailDto, false, '공지사항 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 공지사항입니다.'),
  );
}
