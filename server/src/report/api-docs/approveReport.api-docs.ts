import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { ApproveReportRequestDto } from '@report/dto/request/approveReport.dto';

export function ApiApproveReport() {
  return applyDecorators(
    ApiCookieAuth('sessionId'),
    ApiOperation({
      summary: '관리자 신고 승인(정지 처리) API',
      description:
        '신고를 승인하고 대상을 정지합니다. USER/COMMENT 신고는 유저 정지, RSS/FEED 신고는 RSS 정지로 처리됩니다.',
    }),
    ApiParam({ name: 'id', type: Number, description: '승인할 신고의 ID', example: 1 }),
    ApiBody({ type: ApproveReportRequestDto }),
    ApiCreatedDoc('신고 승인 및 정지 처리 완료'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('해당 ID의 신고가 존재하지 않는 경우'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했거나 정지 대상이 이미 삭제된 경우'),
    ApiConflictDoc('이미 처리된 신고인 경우'),
  );
}
