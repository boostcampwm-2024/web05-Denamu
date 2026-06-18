import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { GetUserProfileImageResponseDto } from '@user/dto/response/getUserProfileImage.dto';

export function ApiGetUserProfileImage() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 프로필 이미지 조회 API',
      description: '특정 사용자의 프로필 이미지 URL을 조회합니다.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '조회할 사용자 ID',
      example: 1,
    }),
    ApiDataResponse(
      GetUserProfileImageResponseDto,
      false,
      '프로필 이미지 조회 성공',
    ),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('존재하지 않는 유저입니다.'),
  );
}
