import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiGetAdminQnas } from '@qna/api-docs/getAdminQnas.api-docs';
import { GetAdminQnasRequestDto } from '@qna/dto/request/getAdminQnas.dto';
import { QnaService } from '@qna/service/qna.service';

@ApiTags('Admin')
@Controller('admins/qna')
@UseGuards(AdminAuthGuard)
export class AdminQnaController {
  constructor(private readonly qnaService: QnaService) {}

  @ApiGetAdminQnas()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAdminQnas(@Query() queryDto: GetAdminQnasRequestDto) {
    return ApiResponse.responseWithData(
      '문의 목록 조회를 성공했습니다.',
      await this.qnaService.getAdminQnas(queryDto),
    );
  }
}
