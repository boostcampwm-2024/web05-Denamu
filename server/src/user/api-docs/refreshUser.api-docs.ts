import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'access 토큰 갱신 API',
    }),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
              },
            },
          },
        },
      },
      example: {
        message: '엑세스 토큰을 재발급했습니다.',
        data: {
          accessToken: 'exampleJWT',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        properties: {
          message: {
            type: 'string',
          },
        },
      },
      example: {
        message: 'Unauthorized',
      },
    }),
  );
}
