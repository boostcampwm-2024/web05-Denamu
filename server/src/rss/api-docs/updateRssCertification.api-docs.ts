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

export function ApiUpdateRssCertification() {
  return applyDecorators(
    ApiOperation({
      summary: '소유 RSS 정보 수정 API',
      description:
        '본인이 인증한 RSS의 블로그 이름과 신청자 이름을 수정합니다. RSS URL(크롤링 대상)은 변경할 수 없습니다.',
    }),
    ApiBearerAuth(),
    ApiMessageResponse('소유 RSS 정보가 성공적으로 수정되었습니다.'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증이 필요합니다.'),
    ApiForbiddenDoc('본인이 인증한 RSS가 아닙니다.'),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
    ApiConflictDoc('이미 사용 중인 블로그 이름입니다.'),
  );
}
