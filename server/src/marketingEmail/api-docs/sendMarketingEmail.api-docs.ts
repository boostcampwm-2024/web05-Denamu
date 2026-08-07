import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { MarketingEmailSummaryDto } from '@marketingEmail/dto/response/marketingEmail.dto';

export function ApiSendMarketingEmail() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({
      summary: '마케팅 이메일 발송 API',
      description:
        '광고성 정보 수신에 동의한 회원에게만 발송됩니다. 제목 맨 앞에 "(광고)"가 자동으로 붙습니다.',
    }),
    ApiCreatedDataResponse(MarketingEmailSummaryDto, false, '이메일 발송 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
