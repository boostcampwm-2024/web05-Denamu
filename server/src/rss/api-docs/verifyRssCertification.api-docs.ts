import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiForbiddenDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiVerifyRssCertification() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 소유 인증 코드 검증 API',
      description:
        '이메일로 발송된 인증 코드를 검증하여 로그인한 사용자에게 RSS 소유권을 연결합니다.',
    }),
    ApiBearerAuth(),
    ApiMessageResponse('RSS 소유 인증 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증이 필요합니다.'),
    ApiForbiddenDoc('본인의 RSS 인증 요청이 아닙니다.'),
    ApiNotFoundDoc('RSS 인증 코드가 만료되었거나 찾을 수 없습니다.'),
    ApiConflictDoc('이미 인증되었거나 인증할 수 없는 RSS입니다.'),
  );
}
