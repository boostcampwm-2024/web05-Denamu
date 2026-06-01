import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiUpdateFeedViewCount() {
  return applyDecorators(
    ApiOperation({ summary: '피드 조회수 업데이트 API' }),
    ApiMessageResponse('조회수 업데이트 성공'),
    ApiBadRequestDoc('피드 ID가 유효하지 않은 경우 400 Bad Request'),
    ApiNotFoundDoc('해당 ID의 피드가 존재하지 않는 경우'),
  );
}
