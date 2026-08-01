import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiConflictDoc,
  ApiCreatedDoc,
  ApiNotFoundDoc,
  ApiUnauthorizedDoc,
} from '@common/swagger/swagger.helper';

const CONFLICT_MESSAGE = '이미 신고한 대상입니다.';

export function ApiCreateUserReport() {
  return applyDecorators(
    ApiOperation({ summary: '사용자 신고 등록 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'userId',
      type: Number,
      description: '신고할 사용자 ID',
      example: 1,
    }),
    ApiCreatedDoc('사용자 신고 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했거나 자기 자신을 신고한 경우'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 사용자입니다.'),
    ApiConflictDoc(CONFLICT_MESSAGE),
  );
}

export function ApiCreateRssReport() {
  return applyDecorators(
    ApiOperation({ summary: 'RSS 신고 등록 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'rssId',
      type: Number,
      description: '신고할 RSS ID',
      example: 1,
    }),
    ApiCreatedDoc('RSS 신고 성공'),
    ApiBadRequestDoc(
      '요청 데이터 검증에 실패했거나 본인 소유 RSS를 신고한 경우',
    ),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 RSS입니다.'),
    ApiConflictDoc(CONFLICT_MESSAGE),
  );
}

export function ApiCreateCommentReport() {
  return applyDecorators(
    ApiOperation({ summary: '댓글 신고 등록 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'commentId',
      type: Number,
      description: '신고할 댓글 ID',
      example: 1,
    }),
    ApiCreatedDoc('댓글 신고 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했거나 자신의 댓글을 신고한 경우'),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 댓글입니다.'),
    ApiConflictDoc(CONFLICT_MESSAGE),
  );
}

export function ApiCreateFeedReport() {
  return applyDecorators(
    ApiOperation({ summary: '게시글 신고 등록 API' }),
    ApiBearerAuth(),
    ApiParam({
      name: 'feedId',
      type: Number,
      description: '신고할 게시글 ID',
      example: 1,
    }),
    ApiCreatedDoc('게시글 신고 성공'),
    ApiBadRequestDoc(
      '요청 데이터 검증에 실패했거나 자신의 게시글을 신고한 경우',
    ),
    ApiUnauthorizedDoc('인증되지 않은 요청입니다.'),
    ApiNotFoundDoc('존재하지 않는 게시글입니다.'),
    ApiConflictDoc(CONFLICT_MESSAGE),
  );
}
