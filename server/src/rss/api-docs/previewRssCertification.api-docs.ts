import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import {
  ApiConflictDoc,
  ApiDataResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

import { PreviewRssCertificationResponseDto } from '@rss/dto/response/previewRssCertification.dto';

export function ApiPreviewRssCertification() {
  return applyDecorators(
    ApiOperation({
      summary: 'RSS 소유 인증 미리보기 API',
      description:
        '블로그 이름으로 RSS를 찾아 인증 전 정보(플랫폼·신청자 이름·RSS URL)와 2차 이메일 인증 필요 여부를 반환합니다. 부작용 없이 조회만 수행합니다.',
    }),
    ApiBearerAuth(),
    ApiDataResponse(PreviewRssCertificationResponseDto),
    ApiUnauthorizedDoc('인증이 필요합니다.'),
    ApiNotFoundDoc('해당 이름의 RSS를 찾을 수 없습니다.'),
    ApiConflictDoc('이미 인증된 RSS입니다.'),
  );
}
