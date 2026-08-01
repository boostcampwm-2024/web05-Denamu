import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiForbiddenDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
} from '@common/swagger/swagger.helper';

export function ApiSetFeedVisibility() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: '소유 RSS 게시글 공개/비공개 전환 API',
      description:
        '본인이 인증한 RSS에 속한 게시글의 공개 여부를 변경합니다. 비공개 처리 시 denamu의 공개 화면(홈/검색/트렌딩/상세)에서 제외됩니다.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: '게시글이 속한 RSS(rss_accept) ID',
      example: 1,
    }),
    ApiParam({
      name: 'feedId',
      type: Number,
      description: '공개/비공개를 변경할 게시글 ID',
      example: 1,
    }),
    ApiMessageResponse('게시글 공개 상태 변경 완료'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
    ApiForbiddenDoc('본인이 인증한 RSS가 아닙니다.'),
    ApiNotFoundDoc('RSS 또는 게시글을 찾을 수 없습니다.'),
  );
}
