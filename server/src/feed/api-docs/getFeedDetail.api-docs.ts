import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { GetFeedDetailResponseDto } from '@feed/dto/response/getFeedDetail';

export function ApiGetFeedDetail() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 상세 모달 데이터 조회 API' }),
    ApiDataResponse(GetFeedDetailResponseDto, false, '게시글 상세 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('해당 게시글을 찾을 수 없습니다.'),
  );
}
