import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse, ApiUnauthorizedDoc } from '@common/swagger/swagger.helper';
import { GetUnreadCountResponseDto } from '@notification/dto/response/getUnreadCount.dto';

export function ApiGetUnreadCount() {
  return applyDecorators(
    ApiOperation({ summary: '읽지 않은 알림 개수 조회 API' }),
    ApiBearerAuth(),
    ApiDataResponse(GetUnreadCountResponseDto, false, '읽지 않은 알림 개수 조회 성공'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
  );
}
