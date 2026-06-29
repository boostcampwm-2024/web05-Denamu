import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';
import {
  ApiBadRequestDoc,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiReadActivityYears() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 활동 연도 목록 조회',
      description: '사용자의 활동 기록이 존재하는 연도 목록을 내림차순으로 조회합니다.',
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: '조회할 사용자 ID',
      example: 1,
    }),
    ApiExtraModels(ApiResponse),
    ApiOkResponse({
      description: '활동 연도 목록 조회 성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { type: 'integer', example: 2024 },
              },
            },
          },
        ],
      },
    }),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('존재하지 않는 사용자'),
  );
}
