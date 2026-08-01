import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ApiBadRequestDoc, ApiDataResponse, ApiUnauthorizedDoc } from '@common/swagger/swagger.helper';
import { GetNotificationsResponseDto } from '@notification/dto/response/getNotifications.dto';

export function ApiGetNotifications() {
  return applyDecorators(
    ApiOperation({ summary: '알림 목록 조회 API (최근 30일, 최신순)' }),
    ApiBearerAuth(),
    ApiDataResponse(GetNotificationsResponseDto, false, '알림 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
