import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';

import { GetRecentRssResponseDto } from '@rss/dto/response/getRecentRss.dto';

export function ApiGetRecentRss() {
  return applyDecorators(
    ApiOperation({
      summary: '최근 발행 RSS 목록 조회 API',
      description:
        '가장 최근에 공개 게시글을 발행한 순서대로 RSS 목록을 최대 10개 조회합니다.',
    }),
    ApiExtraModels(ApiResponse, GetRecentRssResponseDto),
    ApiOkResponse({
      description: '최근 발행 RSS 목록 조회 성공',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(GetRecentRssResponseDto) },
              },
            },
          },
        ],
      },
    }),
  );
}
