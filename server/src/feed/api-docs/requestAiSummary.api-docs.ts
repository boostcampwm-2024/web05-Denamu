import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiConflictDoc,
  ApiMessageResponse,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

export function ApiRequestAiSummary() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 요약 수동 재요청 API (관리자 전용)',
      description:
        'AI 요약에 실패했거나 요청이 전송되지 않은 게시글을 AI 요청 큐에 다시 넣습니다. 비동기로 처리되며 202 Accepted를 반환합니다.',
    }),
    ApiMessageResponse('AI 요약 재요청 접수 성공'),
    ApiUnauthorizedDoc('관리자 인증이 되지 않은 경우'),
    ApiNotFoundDoc('해당 ID의 피드가 존재하지 않는 경우'),
    ApiConflictDoc('이미 AI 요약이 완료된 게시글인 경우'),
  );
}
