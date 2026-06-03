import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiRequestDeleteAccount() {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴 신청 API',
      description:
        '인증된 사용자의 회원탈퇴를 신청합니다. 이메일로 확인 링크가 발송됩니다.',
    }),
    ApiBearerAuth(),
    ApiMessageResponse('회원탈퇴 신청 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증이 필요합니다.'),
    ApiNotFoundDoc('존재하지 않는 사용자입니다.'),
  );
}
