import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import { BoardDetailDto } from '@board/dto/response/board.dto';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiCreateBoard() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '게시글 작성 API' }),
    ApiCreatedDataResponse(BoardDetailDto, false, '게시글 작성 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
