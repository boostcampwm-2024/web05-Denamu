import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiForbiddenDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { GetSubscribersResponseDto } from '@subscribe/dto/response/getSubscribers.dto';

export function ApiGetSubscribers() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 구독자(팔로워) 목록 조회 API',
      description: '본인 소유 RSS의 구독자 목록을 커서 기반으로 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({ name: 'rssId', type: Number, description: 'RSS ID', example: 1 }),
    ApiDataResponse(GetSubscribersResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiForbiddenDoc('본인 소유 RSS가 아닌 경우'),
    ApiNotFoundDoc('해당 ID의 RSS가 존재하지 않는 경우'),
  );
}
