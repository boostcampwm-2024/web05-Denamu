import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { BoardListResponseDto } from '@board/dto/response/board.dto';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

export function ApiGetBoards() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 목록 조회 API' }),
    ApiDataResponse(BoardListResponseDto, false, '게시글 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
