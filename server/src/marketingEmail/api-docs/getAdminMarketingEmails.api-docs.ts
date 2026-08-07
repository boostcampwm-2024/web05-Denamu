import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { MarketingEmailListResponseDto } from '@marketingEmail/dto/response/marketingEmail.dto';

export function ApiGetAdminMarketingEmails() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({ summary: '마케팅 이메일 발송 이력 조회 API' }),
    ApiDataResponse(
      MarketingEmailListResponseDto,
      false,
      '발송 이력 조회 성공',
    ),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
