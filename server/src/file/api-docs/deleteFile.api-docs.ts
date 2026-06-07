import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiForbiddenDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiDeleteFile() {
  return applyDecorators(
    ApiOperation({
      summary: '파일 삭제 API',
      description: '업로드된 파일을 삭제합니다.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: '삭제할 파일의 ID',
      type: 'string',
      example: 'uuid-string',
    }),
    ApiMessageResponse('파일 삭제 성공'),
    ApiBadRequestDoc('잘못된 요청'),
    ApiNotFoundDoc('파일을 찾을 수 없음'),
    ApiUnauthorizedDoc('인증되지 않은 사용자'),
    ApiForbiddenDoc('파일 삭제 권한이 없습니다.'),
  );
}
