import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiUpdateFeedViewCount() {
  return applyDecorators(
    ApiOperation({ summary: '피드 조회수 업데이트 API' }),
    ApiMessageResponse('조회수 업데이트 성공'),
    ApiNotFoundDoc('해당 ID의 피드가 존재하지 않는 경우'),
  );
}
