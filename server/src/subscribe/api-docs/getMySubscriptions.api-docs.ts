import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { SubscribedRssResponseDto } from '@subscribe/dto/response/getMySubscriptions.dto';

export function ApiGetUserSubscriptions() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 구독 RSS 목록 조회 API',
      description: '특정 사용자가 구독 중인 RSS 블로그 목록을 조회합니다.',
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: '구독 목록을 조회할 사용자 ID',
      example: 1,
    }),
    ApiDataResponse(SubscribedRssResponseDto, true),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
