import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ApiBadRequestDoc } from '@common/swagger/swagger.helper';

import { GetLinkedProvidersResponseDto } from '@user/dto/response/getLinkedProviders.dto';

export function ApiOAuthLinkInitiate() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '로그인 상태에서 OAuth 추가 연결 시작 API',
      description: '연결용 OAuth 인증 URL을 반환한다. 클라이언트가 해당 URL로 리디렉션한다.',
    }),
    ApiResponse({ status: 201, description: '연결용 인증 URL 반환' }),
    ApiBadRequestDoc('지원하지 않는 인증 제공자입니다.'),
  );
}

export function ApiOAuthLinks() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: '연결된 OAuth 제공자 목록 조회 API' }),
    ApiResponse({ status: 200, type: GetLinkedProvidersResponseDto }),
  );
}

export function ApiOAuthUnlink() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'OAuth 연결 해제 API' }),
    ApiResponse({ status: 200, description: '연결 해제 완료' }),
    ApiBadRequestDoc('마지막 인증 수단입니다. 비밀번호를 먼저 설정한 후 해제해주세요.'),
  );
}
