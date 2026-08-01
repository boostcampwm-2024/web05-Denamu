import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';

import { ApiReadTags } from '@tag/api-docs/readTag.api-docs';
import { TagService } from '@tag/service/tag.service';

@ApiTags('Tag')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @ApiReadTags()
  @Get()
  @HttpCode(HttpStatus.OK)
  async readTags() {
    return ApiResponse.responseWithData(
      '카테고리별 태그 목록 조회 완료',
      await this.tagService.readTags(),
    );
  }
}
