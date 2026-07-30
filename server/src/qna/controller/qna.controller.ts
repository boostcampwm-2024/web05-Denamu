import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorator';
import { OptionalJwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCreateQna } from '@qna/api-docs/createQna.api-docs';
import { ApiGetQnas } from '@qna/api-docs/getQnas.api-docs';
import { CreateQnaRequestDto } from '@qna/dto/request/createQna.dto';
import { GetQnasRequestDto } from '@qna/dto/request/getQnas.dto';
import { QnaService } from '@qna/service/qna.service';

@ApiTags('Qna')
@Controller('qna')
export class QnaController {
  constructor(private readonly qnaService: QnaService) {}

  @ApiCreateQna()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtGuard)
  async createQna(
    @CurrentUser() user: Payload | null,
    @Body() bodyDto: CreateQnaRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '문의가 성공적으로 등록되었습니다.',
      await this.qnaService.createQna(user, bodyDto),
    );
  }

  @ApiGetQnas()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getQnas(@Query() queryDto: GetQnasRequestDto) {
    return ApiResponse.responseWithData(
      '문의 목록 조회를 성공했습니다.',
      await this.qnaService.getPublicQnas(queryDto),
    );
  }
}
