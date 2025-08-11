import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiDeleteFile() {
  return applyDecorators(
    ApiOperation({
      summary: '파일 삭제 API',
      description: '업로드된 파일을 삭제합니다.',
    }),
    ApiParam({
      name: 'id',
      description: '삭제할 파일의 ID',
      type: 'string',
      example: 'uuid-string',
    }),
    ApiOkResponse({
      description: '파일 삭제 성공',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '파일이 성공적으로 삭제되었습니다.',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: '잘못된 요청',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '유효하지 않은 파일 ID입니다.',
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: '파일을 찾을 수 없음',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '파일을 찾을 수 없습니다.',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '인증되지 않은 사용자',
      schema: {
        properties: {
          message: {
            type: 'string',
            example: '인증이 필요합니다.',
          },
        },
      },
    }),
  );
}
