import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

import { ReadActivityQueryRequestDto } from '@activity/dto/request/readActivity.dto';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, OptionalJwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';
import {
  renderDefaultOgHtml,
  renderRssOgHtml,
} from '@common/util/renderOgHtml';

import { ApiCreateRss } from '@rss/api-docs/createRss.api-docs';
import { ApiCreateRssCertification } from '@rss/api-docs/createRssCertification.api-docs';
import { ApiDeleteCertificateRss } from '@rss/api-docs/deleteCertificateRss.api-docs';
import { ApiDeleteRss } from '@rss/api-docs/deleteRss.api-docs';
import { ApiDeleteRssCertification } from '@rss/api-docs/deleteRssCertification.api-docs';
import { ApiGetOwnedRssFeeds } from '@rss/api-docs/getOwnedRssFeeds.api-docs';
import { ApiGetRecentRss } from '@rss/api-docs/getRecentRss.api-docs';
import { ApiGetRssActivities } from '@rss/api-docs/getRssActivities.api-docs';
import { ApiGetRssActivityYears } from '@rss/api-docs/getRssActivityYears.api-docs';
import { ApiGetRssFeeds } from '@rss/api-docs/getRssFeeds.api-docs';
import { ApiGetRssInfo } from '@rss/api-docs/getRssInfo.api-docs';
import { ApiPreviewRssCertification } from '@rss/api-docs/previewRssCertification.api-docs';
import { ApiSearchRss } from '@rss/api-docs/searchRss.api-docs';
import { ApiSetFeedVisibility } from '@rss/api-docs/setFeedVisibility.api-docs';
import { ApiUpdateRssCertification } from '@rss/api-docs/updateRssCertification.api-docs';
import { ApiVerifyRssCertification } from '@rss/api-docs/verifyRssCertification.api-docs';
import { CreateRssCertificationRequestDto } from '@rss/dto/request/createRssCertification.dto';
import { DeleteCertificateRssRequestDto } from '@rss/dto/request/deleteCertificateRss.dto';
import { DeleteRssRequestDto } from '@rss/dto/request/deleteRss.dto';
import { DeleteRssCertificationParamRequestDto } from '@rss/dto/request/deleteRssCertificationParam.dto';
import { GetOwnedRssFeedsRequestDto } from '@rss/dto/request/getOwnedRssFeeds.dto';
import { GetOwnedRssFeedsParamRequestDto } from '@rss/dto/request/getOwnedRssFeedsParam.dto';
import { GetRssFeedsRequestDto } from '@rss/dto/request/getRssFeeds.dto';
import { GetRssInfoParamRequestDto } from '@rss/dto/request/getRssInfoParam.dto';
import { PreviewRssCertificationRequestDto } from '@rss/dto/request/previewRssCertification.dto';
import { RegisterRssRequestDto } from '@rss/dto/request/registerRss.dto';
import { SearchRssRequestDto } from '@rss/dto/request/searchRss.dto';
import { SetFeedVisibilityRequestDto } from '@rss/dto/request/setFeedVisibility.dto';
import { SetFeedVisibilityParamRequestDto } from '@rss/dto/request/setFeedVisibilityParam.dto';
import { UpdateRssCertificationRequestDto } from '@rss/dto/request/updateRssCertification.dto';
import { UpdateRssCertificationParamRequestDto } from '@rss/dto/request/updateRssCertificationParam.dto';
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

  @ApiPreviewRssCertification()
  @UseGuards(JwtGuard)
  @Get('certifications/preview')
  @HttpCode(HttpStatus.OK)
  async previewRssCertification(
    @CurrentUser() user: Payload,
    @Query() previewRssCertificationDto: PreviewRssCertificationRequestDto,
  ) {
    return ApiResponse.responseWithData(
      'RSS 소유 인증 미리보기를 처리했습니다.',
      await this.rssService.previewRssCertification(
        user,
        previewRssCertificationDto.blogName,
      ),
    );
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

  @ApiUpdateRssCertification()
  @UseGuards(JwtGuard)
  @Patch('certifications/:id')
  @HttpCode(HttpStatus.OK)
  async updateRssCertification(
    @CurrentUser() user: Payload,
    @Param()
    updateRssCertificationParamDto: UpdateRssCertificationParamRequestDto,
    @Body() updateRssCertificationDto: UpdateRssCertificationRequestDto,
  ) {
    await this.rssService.updateRssCertification(
      user,
      updateRssCertificationParamDto.id,
      updateRssCertificationDto.name,
      updateRssCertificationDto.userName,
    );
    return ApiResponse.responseWithNoContent('RSS 정보를 수정했습니다.');
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

  @ApiGetOwnedRssFeeds()
  @UseGuards(JwtGuard)
  @Get('certifications/:id/feeds')
  @HttpCode(HttpStatus.OK)
  async getOwnedRssFeeds(
    @CurrentUser() user: Payload,
    @Param() paramDto: GetOwnedRssFeedsParamRequestDto,
    @Query() queryDto: GetOwnedRssFeedsRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '소유 RSS 게시글 목록 조회를 처리했습니다.',
      await this.rssService.getOwnedRssFeeds(user, paramDto.id, queryDto),
    );
  }

  @ApiSetFeedVisibility()
  @UseGuards(JwtGuard)
  @Patch('certifications/:id/feeds/:feedId/visibility')
  @HttpCode(HttpStatus.OK)
  async setFeedVisibility(
    @CurrentUser() user: Payload,
    @Param() paramDto: SetFeedVisibilityParamRequestDto,
    @Body() bodyDto: SetFeedVisibilityRequestDto,
  ) {
    await this.rssService.setFeedVisibility(
      user,
      paramDto.id,
      paramDto.feedId,
      bodyDto.isPublic,
    );
    return ApiResponse.responseWithNoContent(
      '게시글 공개 상태를 변경했습니다.',
    );
  }

  @ApiGetRecentRss()
  @UseGuards(OptionalJwtGuard)
  @Get('recent')
  @HttpCode(HttpStatus.OK)
  async getRecentRss(@CurrentUser() viewer: Payload | null) {
    return ApiResponse.responseWithData(
      '최근 발행 RSS 목록 조회를 처리했습니다.',
      await this.rssService.getRecentRss(viewer?.id),
    );
  }

  @ApiSearchRss()
  @UseGuards(OptionalJwtGuard)
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchRss(
    @CurrentUser() viewer: Payload | null,
    @Query() searchRssQueryDto: SearchRssRequestDto,
  ) {
    return ApiResponse.responseWithData(
      'RSS 검색 결과 조회 완료',
      await this.rssService.searchRss(searchRssQueryDto, viewer?.id),
    );
  }

  @ApiGetRssActivityYears()
  @Get(':rssId/activities/years')
  @HttpCode(HttpStatus.OK)
  async getRssActivityYears(@Param() paramDto: GetRssInfoParamRequestDto) {
    return ApiResponse.responseWithData(
      'RSS 발행 활동 연도 목록 조회를 처리했습니다.',
      await this.rssService.getRssActivityYears(paramDto.rssId),
    );
  }

  @ApiGetRssActivities()
  @Get(':rssId/activities')
  @HttpCode(HttpStatus.OK)
  async getRssActivities(
    @Param() paramDto: GetRssInfoParamRequestDto,
    @Query() queryDto: ReadActivityQueryRequestDto,
  ) {
    return ApiResponse.responseWithData(
      'RSS 발행 활동 조회를 처리했습니다.',
      await this.rssService.getRssActivities(paramDto.rssId, queryDto.year),
    );
  }

  @ApiGetRssInfo()
  @UseGuards(OptionalJwtGuard)
  @Get(':rssId')
  @HttpCode(HttpStatus.OK)
  async getRssInfo(
    @Param() paramDto: GetRssInfoParamRequestDto,
    @CurrentUser() viewer: Payload | null,
  ) {
    return ApiResponse.responseWithData(
      'RSS 정보 조회를 처리했습니다.',
      await this.rssService.getRssInfo(paramDto.rssId, viewer?.id),
    );
  }

  @ApiGetRssFeeds()
  @Get(':rssId/feeds')
  @HttpCode(HttpStatus.OK)
  async getRssFeeds(
    @Param() paramDto: GetRssInfoParamRequestDto,
    @Query() queryDto: GetRssFeedsRequestDto,
  ) {
    return ApiResponse.responseWithData(
      'RSS 게시글 목록 조회를 처리했습니다.',
      await this.rssService.getRssFeeds(paramDto.rssId, queryDto),
    );
  }

  @ApiExcludeEndpoint()
  @Get(':rssId/og')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getRssOg(@Param() paramDto: GetRssInfoParamRequestDto) {
    try {
      const rss = await this.rssService.getRssInfo(paramDto.rssId);
      return renderRssOgHtml({
        rssId: paramDto.rssId,
        name: rss.name,
        blogImage: rss.blogImage,
      });
    } catch (err) {
      if (err instanceof NotFoundException) {
        return renderDefaultOgHtml();
      }
      throw err;
    }
  }
}
