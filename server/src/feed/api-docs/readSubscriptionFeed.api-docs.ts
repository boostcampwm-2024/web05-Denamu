import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { ReadSubscriptionFeedResponseDto } from '@feed/dto/response/readSubscriptionFeed.dto';

export function ApiReadSubscriptionFeed() {
  return applyDecorators(
    ApiOperation({
      summary: '구독 피드 조회 API',
      description:
        '로그인한 사용자가 구독 중인 RSS 블로그들의 게시글을 커서 기반으로 조회합니다.',
    }),
    ApiBearerAuth(),
    ApiDataResponse(ReadSubscriptionFeedResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
