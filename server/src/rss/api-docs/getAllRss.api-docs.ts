import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

import {
  ApiBadRequestDoc,
  ApiDataResponse,
} from '@common/swagger/swagger.helper';

import { RssListResponseDto } from '@rss/dto/response/rssList.dto';

export function ApiGetAllRss() {
  return applyDecorators(
    ApiOperation({
      summary: '전체 RSS 목록 조회 API',
      description:
        '승인된 RSS(rss_accept) 전체를 최근 공개 게시글 발행일 순으로 페이지네이션하여 조회합니다. 게시글이 없는 RSS는 마지막에 정렬됩니다. 결과는 id, 이름, 플랫폼, 프로필 이미지, 공개 게시글 개수, 최근 게시글 발행일을 포함합니다.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: '페이지 번호',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: '한 페이지에 보여줄 개수',
      example: 20,
    }),
    ApiQuery({
      name: 'blogPlatform',
      required: false,
      type: String,
      description: '필터링할 RSS 블로그 플랫폼',
      example: 'velog',
    }),
    ApiDataResponse(RssListResponseDto, false, '전체 RSS 목록 조회 성공'),
    ApiBadRequestDoc('요청 데이터 검증에 실패했습니다.'),
  );
}
