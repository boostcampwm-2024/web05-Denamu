import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { BoardDetailDto } from '@board/dto/response/board.dto';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiUpdateBoard() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '게시글 수정 API' }),
    ApiDataResponse(BoardDetailDto, false, '게시글 수정 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 게시글입니다.'),
  );
}
