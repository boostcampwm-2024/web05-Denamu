import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { UpdateProfileImageRequestDto } from '@user/dto/request/updateProfileImage.dto';

export function ApiUpdateProfileImage() {
  return applyDecorators(
    ApiOperation({
      summary: '프로필 이미지 변경 API',
      description:
        '사용자의 프로필 이미지를 변경합니다. 하루 최대 변경 횟수 제한이 있습니다.',
    }),
    ApiBearerAuth(),
    ApiBody({ type: UpdateProfileImageRequestDto }),
    ApiMessageResponse('프로필 이미지 변경 성공'),
    ApiBadRequestDoc('하루 변경 한도를 초과했습니다.'),
    ApiUnauthorizedDoc('로그인이 필요합니다.'),
  );
}
