import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { CreateAccessTokenResponseDto } from '@user/dto/response/createAccessToken.dto';

export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({ summary: 'access 토큰 갱신 API' }),
    ApiCookieAuth('refresh_token'),
    ApiDataResponse(CreateAccessTokenResponseDto, false, '액세스 토큰 갱신 성공'),
    ApiUnauthorizedDoc('유효하지 않거나 만료된 리프레시 토큰입니다.'),
  );
}
