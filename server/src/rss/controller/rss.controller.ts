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
import { AdminAuthGuard } from '@common/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RssService } from '@rss/service/rss.service';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { ApiResponse } from '@common/response/common.response';
import { RejectRssRequestDto } from '@rss/dto/request/rejectRss';
import { ManageRssRequestDto } from '@rss/dto/request/manageRss.dto';
import { ApiCreateRss } from '@rss/api-docs/createRss.api-docs';
import { ApiAcceptRss } from '@rss/api-docs/acceptRss.api-docs';
import { ApiReadRssAcceptHistory } from '@rss/api-docs/readRssAcceptHistory.api-docs';
import { ApiReadRssRejectHistory } from '@rss/api-docs/readRssRejectHistory.api-docs';
import { ApiReadAllRss } from '@rss/api-docs/readAllRss.api-docs';
import { ApiRejectRss } from '@rss/api-docs/rejectRss.api-docs';
import { ApiDeleteRss } from '@rss/api-docs/deleteRss.api-docs';
import { DeleteRssRequestDto } from '@rss/dto/request/deleteRss.dto';
import { ApiDeleteCertificateRss } from '@rss/api-docs/deleteCertificateRss.api-docs';
import { DeleteCertificateRssRequestDto } from '@rss/dto/request/deleteCertificateRss.dto';

@ApiTags('RSS')
@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @ApiCreateRss()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRss(@Body() rssRegisterBodyDto: RegisterRssRequestDto) {
    await this.rssService.createRss(rssRegisterBodyDto);
    return ApiResponse.responseWithNoContent('신청이 완료되었습니다.');
  }

  @ApiReadAllRss()
  @UseGuards(AdminAuthGuard)
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
  async acceptRss(@Param() rssAcceptParamDto: ManageRssRequestDto) {
    await this.rssService.acceptRss(rssAcceptParamDto);
    return ApiResponse.responseWithNoContent('승인이 완료되었습니다.');
  }

  @ApiRejectRss()
  @UseGuards(AdminAuthGuard)
  @Post('reject/:id')
  @HttpCode(HttpStatus.CREATED)
  async rejectRss(
    @Body() rssRejectBodyDto: RejectRssRequestDto,
    @Param() rssRejectParamDto: ManageRssRequestDto,
  ) {
    await this.rssService.rejectRss(rssRejectParamDto, rssRejectBodyDto);
    return ApiResponse.responseWithNoContent('거절이 완료되었습니다.');
  }

  @ApiReadRssAcceptHistory()
  @UseGuards(AdminAuthGuard)
  @Get('history/accept')
  @HttpCode(HttpStatus.OK)
  async readAcceptHistory() {
    return ApiResponse.responseWithData(
      '승인 기록 조회가 완료되었습니다.',
      await this.rssService.readAcceptHistory(),
    );
  }

  @ApiReadRssRejectHistory()
  @UseGuards(AdminAuthGuard)
  @Get('history/reject')
  @HttpCode(HttpStatus.OK)
  async readRejectHistory() {
    return ApiResponse.responseWithData(
      'RSS 거절 기록을 조회하였습니다.',
      await this.rssService.readRejectHistory(),
    );
  }

  @ApiDeleteRss()
  @Post('remove')
  @HttpCode(HttpStatus.OK)
  async requestRemoveRss(@Body() requestDeleteRssDto: DeleteRssRequestDto) {
    await this.rssService.requestRemove(requestDeleteRssDto);
    return ApiResponse.responseWithNoContent('RSS 삭제 요청을 성공했습니다.');
  }

  @ApiDeleteCertificateRss()
  @Delete('remove/:code')
  @HttpCode(HttpStatus.OK)
  async deleteRss(@Param() deleteRssDto: DeleteCertificateRssRequestDto) {
    await this.rssService.deleteRss(deleteRssDto);
    return ApiResponse.responseWithNoContent('RSS 삭제를 성공했습니다.');
  }
}
