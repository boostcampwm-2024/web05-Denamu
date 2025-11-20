import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiRequestDeleteAccount() {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴 신청 API',
      description:
        '인증된 사용자의 회원탈퇴를 신청합니다. 이메일로 확인 링크가 발송됩니다.',
    }),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: '회원탈퇴 신청이 성공적으로 처리되었습니다.',
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      example: {
        message: '오류 메세지',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      example: {
        message: '인증이 필요합니다.',
      },
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      example: {
        message: '존재하지 않는 사용자입니다.',
      },
    }),
  );
}
