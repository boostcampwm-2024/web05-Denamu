import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CookieAuthGuard } from '../../common/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RssService } from '../service/rss.service';
import { RssRegisterRequestDto } from '../dto/request/rss-register.dto';
import { ApiResponse } from '../../common/response/common.response';
import { RejectRssRequestDto } from '../dto/request/rss-reject.dto';
import { RssManagementRequestDto } from '../dto/request/rss-management.dto';
import { ApiCreateRss } from '../api-docs/createRss.api-docs';
import { ApiAcceptRss } from '../api-docs/acceptRss.api-docs';
import { ApiReadAcceptHistory } from '../api-docs/readAcceptHistoryRss.api-docs';
import { ApiReadRejectHistory } from '../api-docs/readRejectHistoryRss.api-docs';
import { ApiReadAllRss } from '../api-docs/readAllRss.api-docs';
import { ApiRejectRss } from '../api-docs/rejectRss.api-docs';

@ApiTags('RSS')
@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @ApiCreateRss()
  @Post()
  async createRss(@Body() rssRegisterBodyDto: RssRegisterRequestDto) {
    await this.rssService.createRss(rssRegisterBodyDto);
    return ApiResponse.responseWithNoContent('신청이 완료되었습니다.');
  }

  @ApiReadAllRss()
  @Get()
  @HttpCode(200)
  async readAllRss() {
    return ApiResponse.responseWithData(
      'Rss 조회 완료',
      await this.rssService.readAllRss(),
    );
  }

  @ApiAcceptRss()
  @UseGuards(CookieAuthGuard)
  @Post('accept/:id')
  @HttpCode(201)
  async acceptRss(@Param() rssAcceptParamDto: RssManagementRequestDto) {
    await this.rssService.acceptRss(rssAcceptParamDto);
    return ApiResponse.responseWithNoContent('승인이 완료되었습니다.');
  }

  @ApiRejectRss()
  @UseGuards(CookieAuthGuard)
  @Post('reject/:id')
  @HttpCode(201)
  async rejectRss(
    @Body() rssRejectBodyDto: RejectRssRequestDto,
    @Param() rssRejectParamDto: RssManagementRequestDto,
  ) {
    await this.rssService.rejectRss(rssRejectParamDto, rssRejectBodyDto);
    return ApiResponse.responseWithNoContent('거절이 완료되었습니다.');
  }

  @ApiReadAcceptHistory()
  @UseGuards(CookieAuthGuard)
  @Get('history/accept')
  async readAcceptHistory() {
    return ApiResponse.responseWithData(
      '승인 기록 조회가 완료되었습니다.',
      await this.rssService.readAcceptHistory(),
    );
  }

  @ApiReadRejectHistory()
  @UseGuards(CookieAuthGuard)
  @Get('history/reject')
  async readRejectHistory() {
    return ApiResponse.responseWithData(
      'RSS 거절 기록을 조회하였습니다.',
      await this.rssService.readRejectHistory(),
    );
  }
}
