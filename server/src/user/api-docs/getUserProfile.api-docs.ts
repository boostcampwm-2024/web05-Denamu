import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

import { GetUserProfileResponseDto } from '@user/dto/response/getUserProfile.dto';

export function ApiGetUserProfile() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 프로필 조회 API',
      description:
        '특정 사용자의 이름, 프로필 이미지, 자기소개와 스트릭 통계(최장/현재 스트릭, 총 읽기 횟수)를 조회합니다.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '조회할 사용자 ID',
      example: 1,
    }),
    ApiDataResponse(GetUserProfileResponseDto, false, '프로필 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('존재하지 않는 유저입니다.'),
  );
}
