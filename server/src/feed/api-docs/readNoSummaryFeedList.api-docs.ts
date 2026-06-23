import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { ApiDataResponse, ApiUnauthorizedDoc } from '@common/swagger/swagger.helper';
import { ReadNoSummaryFeedResponseDto } from '@feed/dto/response/readNoSummaryFeed.dto';

export function ApiReadNoSummaryFeedList() {
  return applyDecorators(
    ApiOperation({
      summary: 'AI 요약이 없는 게시글 목록 조회 API (관리자 전용)',
      description:
        'AI 요약이 비어있는(생성 실패 또는 미생성) 공개 게시글 전체 목록을 반환합니다. AI 요약 재요청 대상 선택에 사용합니다.',
    }),
    ApiDataResponse(ReadNoSummaryFeedResponseDto, true, 'AI 요약 없는 게시글 목록 조회 성공'),
    ApiUnauthorizedDoc('관리자 인증이 되지 않은 경우'),
  );
}
