import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentAdmin } from '@common/decorator/current-admin.decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCreateQnaAnswer } from '@qna/api-docs/createQnaAnswer.api-docs';
import { ApiGetAdminQna } from '@qna/api-docs/getAdminQna.api-docs';
import { ApiGetAdminQnas } from '@qna/api-docs/getAdminQnas.api-docs';
import { CreateQnaAnswerRequestDto } from '@qna/dto/request/createQnaAnswer.dto';
import { GetAdminQnasRequestDto } from '@qna/dto/request/getAdminQnas.dto';
import { GetQnaRequestDto } from '@qna/dto/request/getQna.dto';
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

  @ApiGetAdminQna()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getAdminQna(@Param() paramDto: GetQnaRequestDto) {
    return ApiResponse.responseWithData(
      '문의 상세 조회를 성공했습니다.',
      await this.qnaService.getAdminQna(paramDto.id),
    );
  }

  @ApiCreateQnaAnswer()
  @Post('/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  async createQnaAnswer(
    @CurrentAdmin() email: string,
    @Param() paramDto: GetQnaRequestDto,
    @Body() bodyDto: CreateQnaAnswerRequestDto,
  ) {
    await this.qnaService.createQnaAnswer(email, paramDto.id, bodyDto);
    return ApiResponse.responseWithNoContent('답변 등록을 성공했습니다.');
  }
}
