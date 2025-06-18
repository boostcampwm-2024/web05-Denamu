import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../common/guard/jwt.guard';
import { ApiResponse } from '../../common/response/common.response';
import { LikeService } from '../service/like.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateLike } from '../api-docs/createLike.api-docs';
import { ApiDeleteLike } from '../api-docs/deleteLike.api-docs';
import { FeedLikeRequestDto } from '../dto/request/like.dto';

@ApiTags('Like')
@Controller('like')
@UseGuards(JwtGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiCreateLike()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLike(@Req() req, @Body() feedLikeDto: FeedLikeRequestDto) {
    await this.likeService.create(req.user, feedLikeDto);
    return ApiResponse.responseWithNoContent('좋아요 등록을 성공했습니다.');
  }

  @ApiDeleteLike()
  @Delete('/:feedId')
  @HttpCode(HttpStatus.OK)
  async deleteLike(@Req() req, @Param() feedLikeDto: FeedLikeRequestDto) {
    await this.likeService.delete(req.user, feedLikeDto);
    return ApiResponse.responseWithNoContent('좋아요 삭제를 성공했습니다.');
  }
}
