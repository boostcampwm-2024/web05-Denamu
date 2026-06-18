import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiResponse } from '@common/response/common.response';

import { ApiGetUserLikes } from '@like/api-docs/getUserLikes.api-docs';
import { GetUserLikesRequestDto } from '@like/dto/request/getUserLikes.dto';
import { GetUserLikesParamRequestDto } from '@like/dto/request/getUserLikesParam.dto';
import { LikeService } from '@like/service/like.service';

@ApiTags('Like')
@Controller('users/:userId/likes')
export class UserLikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiGetUserLikes()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserLikes(
    @Param() paramDto: GetUserLikesParamRequestDto,
    @Query() queryDto: GetUserLikesRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '유저 좋아요 조회를 성공했습니다.',
      await this.likeService.getLikesByUser(paramDto.userId, queryDto),
    );
  }
}
