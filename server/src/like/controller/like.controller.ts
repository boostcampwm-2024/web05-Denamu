import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guard/jwt.guard';
import { ApiResponse } from '../../common/response/common.response';
import { LikeService } from '../service/like.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateLike } from '../api-docs/createLike.api-docs';
import { ApiDeleteLike } from '../api-docs/deleteLike.api-docs';
import { FeedLikeRequestDto } from '../dto/request/like.dto';
import { ApiGetLike } from '../api-docs/getLike.api-docs';
import { InjectUserInterceptor } from '../../common/auth/jwt.interceptor';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiGetLike()
  @Get('/:feedId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(InjectUserInterceptor)
  async getLike(@Req() req, @Param() feedLikeDto: FeedLikeRequestDto) {
    return ApiResponse.responseWithData(
      '좋아요 조회를 성공했습니다.',
      await this.likeService.get(req.user, feedLikeDto),
    );
  }

  @ApiCreateLike()
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createLike(@Req() req, @Body() feedLikeDto: FeedLikeRequestDto) {
    await this.likeService.create(req.user, feedLikeDto);
    return ApiResponse.responseWithNoContent('좋아요 등록을 성공했습니다.');
  }

  @ApiDeleteLike()
  @Delete('/:feedId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteLike(@Req() req, @Param() feedLikeDto: FeedLikeRequestDto) {
    await this.likeService.delete(req.user, feedLikeDto);
    return ApiResponse.responseWithNoContent('좋아요 삭제를 성공했습니다.');
  }
}
