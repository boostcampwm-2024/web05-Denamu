import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { GetUserLikesResponseDto } from '@like/dto/response/getUserLikes.dto';

export function ApiGetUserLikes() {
  return applyDecorators(
    ApiOperation({ summary: '특정 유저가 좋아요를 누른 목록 조회 API' }),
    ApiParam({ name: 'userId', type: Number, description: '사용자 ID', example: 1 }),
    ApiDataResponse(GetUserLikesResponseDto, false, '유저 좋아요 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('존재하지 않는 유저입니다.'),
  );
}
