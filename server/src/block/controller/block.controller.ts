import {
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
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiCreateBlock } from '@block/api-docs/createBlock.api-docs';
import { ApiCreateRssBlock } from '@block/api-docs/createRssBlock.api-docs';
import { ApiDeleteBlock } from '@block/api-docs/deleteBlock.api-docs';
import { ApiDeleteRssBlock } from '@block/api-docs/deleteRssBlock.api-docs';
import { ApiGetBlockedRss } from '@block/api-docs/getBlockedRss.api-docs';
import { ApiGetBlockedUsers } from '@block/api-docs/getBlockedUsers.api-docs';
import { ManageBlockRequestDto } from '@block/dto/request/manageBlock.dto';
import { ManageRssBlockRequestDto } from '@block/dto/request/manageRssBlock.dto';
import { BlockService } from '@block/service/block.service';

@ApiTags('Block')
@Controller('blocks')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @ApiGetBlockedUsers()
  @Get()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getBlockedUsers(@CurrentUser() user: Payload) {
    return ApiResponse.responseWithData(
      '차단 목록 조회를 성공했습니다.',
      await this.blockService.getBlockedUsers(user),
    );
  }

  @ApiGetBlockedRss()
  @Get('/rss')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getBlockedRssList(@CurrentUser() user: Payload) {
    return ApiResponse.responseWithData(
      'RSS 차단 목록 조회를 성공했습니다.',
      await this.blockService.getBlockedRssList(user),
    );
  }

  @ApiCreateRssBlock()
  @Post('/rss/:rssId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createRssBlock(
    @CurrentUser() user: Payload,
    @Param() rssBlockDto: ManageRssBlockRequestDto,
  ) {
    await this.blockService.createRssBlock(user, rssBlockDto);
    return ApiResponse.responseWithNoContent('RSS 차단을 성공했습니다.');
  }

  @ApiDeleteRssBlock()
  @Delete('/rss/:rssId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteRssBlock(
    @CurrentUser() user: Payload,
    @Param() rssBlockDto: ManageRssBlockRequestDto,
  ) {
    await this.blockService.deleteRssBlock(user, rssBlockDto);
    return ApiResponse.responseWithNoContent('RSS 차단 해제를 성공했습니다.');
  }

  @ApiCreateBlock()
  @Post('/:userId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlock(
    @CurrentUser() user: Payload,
    @Param() blockDto: ManageBlockRequestDto,
  ) {
    await this.blockService.create(user, blockDto);
    return ApiResponse.responseWithNoContent('사용자 차단을 성공했습니다.');
  }

  @ApiDeleteBlock()
  @Delete('/:userId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteBlock(
    @CurrentUser() user: Payload,
    @Param() blockDto: ManageBlockRequestDto,
  ) {
    await this.blockService.delete(user, blockDto);
    return ApiResponse.responseWithNoContent('사용자 차단 해제를 성공했습니다.');
  }
}
