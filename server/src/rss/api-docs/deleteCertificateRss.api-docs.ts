import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteCertificateRss() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 삭제 인증 API' }),
    ApiParam({ name: 'code', type: String, description: '이메일 인증 코드', example: 'test code' }),
    ApiMessageResponse('RSS 삭제 완료'),
    ApiNotFoundDoc('RSS 삭제 요청 인증 코드가 만료되었거나 찾을 수 없습니다.'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
