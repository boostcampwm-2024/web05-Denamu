import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiCreatedDataResponse,
} from '@common/swagger/swagger.helper';

import { QnaCreatedDto } from '@qna/dto/response/qna.dto';

export function ApiCreateQna() {
  return applyDecorators(
    ApiOperation({
      summary: '문의 작성 API',
      description:
        '로그인 상태면 회원 정보로, 비로그인 상태면 guestName/guestEmail/password로 작성합니다.',
    }),
    ApiCreatedDataResponse(QnaCreatedDto, false, '문의 작성 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
