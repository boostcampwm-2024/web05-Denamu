import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { GetUserRssResponseDto } from '@user/dto/response/getUserRss.dto';

export function ApiGetUserRss() {
  return applyDecorators(
    ApiOperation({
      summary: '특정 사용자 소유 RSS 조회 API',
      description:
        '특정 사용자가 소유 인증한 RSS 목록을 조회합니다. 이메일 등 민감 정보는 응답에서 제외됩니다.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '소유 RSS를 조회할 사용자 ID',
      example: 1,
    }),
    ApiDataResponse(GetUserRssResponseDto, true),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
