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
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard, Payload } from '@src/common/guard/jwt.guard';
import { ApiResponse } from '@src/common/response/common.response';
import { LikeService } from '@src/like/service/like.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateLike } from '@src/like/api-docs/createLike.api-docs';
import { ApiDeleteLike } from '@src/like/api-docs/deleteLike.api-docs';
import { ManageLikeRequestDto } from '@src/like/dto/request/manageLike.dto';
import { ApiGetLike } from '@src/like/api-docs/getLike.api-docs';
import { InjectUserInterceptor } from '@src/common/auth/jwt.interceptor';
import { CurrentUser } from '@src/common/decorator';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiGetLike()
  @Get('/:feedId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(InjectUserInterceptor)
  async getLike(
    @CurrentUser() user: Payload | null,
    @Param() feedLikeDto: ManageLikeRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '좋아요 조회를 성공했습니다.',
      await this.likeService.get(user, feedLikeDto),
    );
  }

  @ApiCreateLike()
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createLike(
    @CurrentUser() user: Payload,
    @Body() feedLikeDto: ManageLikeRequestDto,
  ) {
    await this.likeService.create(user, feedLikeDto);
    return ApiResponse.responseWithNoContent('좋아요 등록을 성공했습니다.');
  }

  @ApiDeleteLike()
  @Delete('/:feedId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteLike(
    @CurrentUser() user: Payload,
    @Param() feedLikeDto: ManageLikeRequestDto,
  ) {
    await this.likeService.delete(user, feedLikeDto);
    return ApiResponse.responseWithNoContent('좋아요 삭제를 성공했습니다.');
  }
}
