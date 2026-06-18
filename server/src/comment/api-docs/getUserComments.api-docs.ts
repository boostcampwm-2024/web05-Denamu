import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { GetUserCommentsResponseDto } from '@comment/dto/response/getUserComments.dto';

export function ApiGetUserComments() {
  return applyDecorators(
    ApiOperation({ summary: '특정 유저가 작성한 댓글 목록 조회 API' }),
    ApiParam({ name: 'userId', type: Number, description: '사용자 ID', example: 1 }),
    ApiDataResponse(
      GetUserCommentsResponseDto,
      false,
      '유저 댓글 목록 조회 성공',
    ),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('존재하지 않는 유저입니다.'),
  );
}
