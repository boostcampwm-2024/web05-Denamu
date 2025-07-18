import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: '사용자 정보 수정 API',
      description: '사용자의 이름, 프로필 이미지, 자기소개를 수정합니다.',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: '사용자 정보 수정 성공',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: '사용자 정보가 성공적으로 수정되었습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: '잘못된 요청',
      example: {
        message: '유효성 검사 오류 메시지',
      },
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: '인증 실패',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: '로그인이 필요합니다.',
      },
    }),
  );
}
