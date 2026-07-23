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
import { ApiDeleteBlock } from '@block/api-docs/deleteBlock.api-docs';
import { ApiGetBlockedUsers } from '@block/api-docs/getBlockedUsers.api-docs';
import { ManageBlockRequestDto } from '@block/dto/request/manageBlock.dto';
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
