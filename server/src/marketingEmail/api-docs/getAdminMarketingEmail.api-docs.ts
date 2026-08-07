import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { MarketingEmailDetailDto } from '@marketingEmail/dto/response/marketingEmail.dto';

export function ApiGetAdminMarketingEmail() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '마케팅 이메일 발송 상세 조회 API' }),
    ApiDataResponse(MarketingEmailDetailDto, false, '발송 상세 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 발송 이력입니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
