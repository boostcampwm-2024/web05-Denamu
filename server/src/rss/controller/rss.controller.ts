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
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorator';
import { AdminAuthGuard } from '@common/guard/session.guard';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiAcceptRss } from '@rss/api-docs/acceptRss.api-docs';
import { ApiCreateRss } from '@rss/api-docs/createRss.api-docs';
import { ApiCreateRssCertification } from '@rss/api-docs/createRssCertification.api-docs';
import { ApiDeleteCertificateRss } from '@rss/api-docs/deleteCertificateRss.api-docs';
import { ApiDeleteRss } from '@rss/api-docs/deleteRss.api-docs';
import { ApiDeleteRssCertification } from '@rss/api-docs/deleteRssCertification.api-docs';
import { ApiReadAllRss } from '@rss/api-docs/readAllRss.api-docs';
import { ApiReadRssAcceptHistory } from '@rss/api-docs/readRssAcceptHistory.api-docs';
import { ApiReadRssRejectHistory } from '@rss/api-docs/readRssRejectHistory.api-docs';
import { ApiRejectRss } from '@rss/api-docs/rejectRss.api-docs';
import { ApiVerifyRssCertification } from '@rss/api-docs/verifyRssCertification.api-docs';
import { CreateRssCertificationRequestDto } from '@rss/dto/request/createRssCertification.dto';
import { DeleteCertificateRssRequestDto } from '@rss/dto/request/deleteCertificateRss.dto';
import { DeleteRssCertificationParamRequestDto } from '@rss/dto/request/deleteRssCertificationParam.dto';
import { DeleteRssRequestDto } from '@rss/dto/request/deleteRss.dto';
import { ManageRssRequestDto } from '@rss/dto/request/manageRss.dto';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { RejectRssRequestDto } from '@rss/dto/request/rejectRss';
import { VerifyRssCertificationRequestDto } from '@rss/dto/request/verifyRssCertification.dto';
import { RssService } from '@rss/service/rss.service';

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

  @ApiCreateRssCertification()
  @UseGuards(JwtGuard)
  @Post('certifications')
  @HttpCode(HttpStatus.OK)
  async createRssCertification(
    @CurrentUser() user: Payload,
    @Body() createRssCertificationDto: CreateRssCertificationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      'RSS 소유 인증 요청을 처리했습니다.',
      await this.rssService.createRssCertification(
        user,
        createRssCertificationDto.blogName,
      ),
    );
  }

  @ApiVerifyRssCertification()
  @UseGuards(JwtGuard)
  @Post('certifications/verify')
  @HttpCode(HttpStatus.OK)
  async verifyRssCertification(
    @CurrentUser() user: Payload,
    @Body() verifyRssCertificationDto: VerifyRssCertificationRequestDto,
  ) {
    await this.rssService.verifyRssCertification(
      user,
      verifyRssCertificationDto.code,
    );
    return ApiResponse.responseWithNoContent('RSS 소유 인증을 완료했습니다.');
  }

  @ApiDeleteRssCertification()
  @UseGuards(JwtGuard)
  @Delete('certifications/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRssCertification(
    @CurrentUser() user: Payload,
    @Param() deleteRssCertificationDto: DeleteRssCertificationParamRequestDto,
  ) {
    await this.rssService.deleteRssCertification(
      user,
      deleteRssCertificationDto.id,
    );
    return ApiResponse.responseWithNoContent('RSS 소유 인증을 해제했습니다.');
  }
}
