import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { CreateRssCertificationResponseDto } from '@rss/dto/response/createRssCertification.dto';

export function ApiCreateRssCertification() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 소유 인증 요청 API',
      description:
        '블로그 이름으로 RSS를 찾아 해당 블로그의 플랫폼·신청자 이름을 반환합니다. RSS에 등록된 이메일과 로그인한 사용자의 이메일이 같으면 즉시 인증(certified=true)되고, 다르면 RSS 등록 이메일로 인증 코드가 발송됩니다(certified=false).',
    }),
    ApiBearerAuth(),
    ApiDataResponse(CreateRssCertificationResponseDto),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiUnauthorizedDoc('인증이 필요합니다.'),
    ApiNotFoundDoc('해당 이름의 RSS를 찾을 수 없습니다.'),
    ApiConflictDoc('이미 인증된 RSS입니다.'),
  );
}
