import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiForbiddenDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteRssCertification() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 소유 인증 해제 API',
      description:
        '본인이 인증한 RSS의 소유 연결을 해제합니다. RSS 데이터 자체는 삭제되지 않고 사용자와의 연결(user_id)만 끊어집니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: Number,
      description: '인증을 해제할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiMessageResponse('RSS 소유 인증 해제 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증이 필요합니다.'),
    ApiForbiddenDoc('본인이 인증한 RSS가 아닙니다.'),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
  );
}
