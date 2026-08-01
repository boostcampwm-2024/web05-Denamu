import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import { BoardDetailDto } from '@board/dto/response/board.dto';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiGetBoard() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 상세 조회 API' }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '게시글 ID',
      example: 1,
    }),
    ApiDataResponse(BoardDetailDto, false, '게시글 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 게시글입니다.'),
  );
}
