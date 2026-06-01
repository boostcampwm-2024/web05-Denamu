import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';
import { ReadActivityResponseDto } from '@activity/dto/response/readActivity.dto';

export function ApiReadActivities() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 활동 데이터 조회',
      description:
        '특정 연도의 사용자 일별 활동 데이터와 스트릭 정보를 조회합니다.',
    }),
    ApiParam({ name: 'userId', type: Number, description: '조회할 사용자 ID', example: 1 }),
    ApiQuery({ name: 'year', required: true, type: Number, description: '조회할 연도', example: 2024 }),
    ApiDataResponse(ReadActivityResponseDto, false, '사용자 활동 데이터 조회 성공'),
    ApiNotFoundDoc('존재하지 않는 사용자'),
  );
}
