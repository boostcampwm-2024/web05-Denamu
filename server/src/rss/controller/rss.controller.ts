import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../common/guard/auth.guard';
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
import { ApiRequestDeleteRss } from '../api-docs/requestDeleteRss.api-docs';
import { RequestDeleteRssDto } from '../dto/request/rss-request-delete.dto';
import { ApiDeleteRss } from '../api-docs/deleteRss.api-docs';
import { DeleteRssDto } from '../dto/request/rss-delete.dto';

@ApiTags('RSS')
@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @ApiCreateRss()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRss(@Body() rssRegisterBodyDto: RssRegisterRequestDto) {
    await this.rssService.createRss(rssRegisterBodyDto);
    return ApiResponse.responseWithNoContent('신청이 완료되었습니다.');
  }

  @ApiReadAllRss()
  @Get()
  @HttpCode(HttpStatus.OK)
  async readAllRss() {
    return ApiResponse.responseWithData(
      'Rss 조회 완료',
      await this.rssService.readAllRss(),
    );
  }

  @ApiAcceptRss()
  @UseGuards(AdminAuthGuard)
  @Post('accept/:id')
  @HttpCode(HttpStatus.CREATED)
  async acceptRss(@Param() rssAcceptParamDto: RssManagementRequestDto) {
    await this.rssService.acceptRss(rssAcceptParamDto);
    return ApiResponse.responseWithNoContent('승인이 완료되었습니다.');
  }

  @ApiRejectRss()
  @UseGuards(AdminAuthGuard)
  @Post('reject/:id')
  @HttpCode(HttpStatus.CREATED)
  async rejectRss(
    @Body() rssRejectBodyDto: RejectRssRequestDto,
    @Param() rssRejectParamDto: RssManagementRequestDto,
  ) {
    await this.rssService.rejectRss(rssRejectParamDto, rssRejectBodyDto);
    return ApiResponse.responseWithNoContent('거절이 완료되었습니다.');
  }

  @ApiReadAcceptHistory()
  @UseGuards(AdminAuthGuard)
  @Get('history/accept')
  @HttpCode(HttpStatus.OK)
  async readAcceptHistory() {
    return ApiResponse.responseWithData(
      '승인 기록 조회가 완료되었습니다.',
      await this.rssService.readAcceptHistory(),
    );
  }

  @ApiReadRejectHistory()
  @UseGuards(AdminAuthGuard)
  @Get('history/reject')
  @HttpCode(HttpStatus.OK)
  async readRejectHistory() {
    return ApiResponse.responseWithData(
      'RSS 거절 기록을 조회하였습니다.',
      await this.rssService.readRejectHistory(),
    );
  }

  @ApiRequestDeleteRss()
  @Post('remove')
  @HttpCode(HttpStatus.OK)
  async requestRemoveRss(@Body() requestDeleteRssDto: RequestDeleteRssDto) {
    await this.rssService.requestRemove(requestDeleteRssDto);
    return ApiResponse.responseWithNoContent('RSS 삭제 요청을 성공했습니다.');
  }

  @ApiDeleteRss()
  @Delete('remove/:code')
  @HttpCode(HttpStatus.OK)
  async deleteRss(@Param() deleteRssDto: DeleteRssDto) {
    await this.rssService.deleteRss(deleteRssDto);
    return ApiResponse.responseWithNoContent('RSS 삭제를 성공했습니다.');
  }
}
