import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { BoardDetailDto } from '@board/dto/response/board.dto';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetAdminBoard() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '관리자 게시글 상세 조회 API' }),
    ApiDataResponse(BoardDetailDto, false, '게시글 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 게시글입니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
