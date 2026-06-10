import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { UpdateUserRequestDto } from '@user/dto/request/updateUser.dto';

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 정보 수정 API',
      description: '사용자의 이름, 프로필 이미지, 자기소개를 수정합니다.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: UpdateUserRequestDto }),
    ApiMessageResponse('사용자 정보 수정 성공'),
    ApiBadRequestDoc('잘못된 요청'),
    ApiUnauthorizedDoc('로그인이 필요합니다.'),
  );
}
