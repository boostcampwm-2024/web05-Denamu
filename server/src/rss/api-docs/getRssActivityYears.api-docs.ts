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

export function ApiGetRssActivityYears() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 발행 활동 연도 목록 조회 API',
      description:
        '특정 RSS의 공개 게시글이 발행된 연도 목록을 내림차순으로 조회합니다.',
    }),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '조회할 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiExtraModels(ApiResponse),
    ApiOkResponse({
      description: '발행 활동 연도 목록 조회 성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { type: 'integer', example: 2025 },
              },
            },
          },
        ],
      },
    }),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiNotFoundDoc('RSS를 찾을 수 없습니다.'),
  );
}
