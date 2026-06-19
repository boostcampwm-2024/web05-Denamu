import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

import { ReadActivityResponseDto } from '@activity/dto/response/readActivity.dto';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiReadActivities() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 활동 데이터 조회',
      description: '특정 연도의 사용자 일별 활동 데이터를 조회합니다.',
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: '조회할 사용자 ID',
      example: 1,
    }),
    ApiQuery({
      name: 'year',
      required: true,
      type: Number,
      description: '조회할 연도',
      example: 2024,
    }),
    ApiDataResponse(
      ReadActivityResponseDto,
      false,
      '사용자 활동 데이터 조회 성공',
    ),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('존재하지 않는 사용자'),
  );
}
