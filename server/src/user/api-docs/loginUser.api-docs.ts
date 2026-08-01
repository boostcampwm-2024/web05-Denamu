import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';
import { LoginUserRequestDto } from '@user/dto/request/loginUser.dto';
import { CreateAccessTokenResponseDto } from '@user/dto/response/createAccessToken.dto';

export function ApiLoginUser() {
  return applyDecorators(
    ApiOperation({ summary: '회원 로그인 API' }),
    ApiBody({ type: LoginUserRequestDto }),
    ApiDataResponse(CreateAccessTokenResponseDto, false, '로그인 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('아이디 혹은 비밀번호가 잘못되었습니다.'),
  );
}
