import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { GetSubscriptionResponseDto } from '@subscribe/dto/response/getSubscription.dto';

export function ApiGetSubscription() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 구독 상태 조회 API',
      description: '요청자의 구독 여부와 해당 RSS의 총 구독자 수를 조회합니다.',
    }),
    ApiParam({ name: 'rssId', type: Number, description: 'RSS ID', example: 1 }),
    ApiDataResponse(GetSubscriptionResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('해당 ID의 RSS가 존재하지 않는 경우'),
  );
}
