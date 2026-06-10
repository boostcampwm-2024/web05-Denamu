import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { CertificateUserRequestDto } from '@user/dto/request/certificateUser.dto';

export function ApiCertificateUser() {
  return applyDecorators(
    ApiOperation({ summary: '회원 인증 API' }),
    ApiBody({ type: CertificateUserRequestDto }),
    ApiMessageResponse('이메일 인증 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('인증에 실패했습니다.'),
  );
}
