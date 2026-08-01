import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiGetUserComments } from '@comment/api-docs/getUserComments.api-docs';
import { GetUserCommentsRequestDto } from '@comment/dto/request/getUserComments.dto';
import { GetUserCommentsParamRequestDto } from '@comment/dto/request/getUserCommentsParam.dto';
import { CommentService } from '@comment/service/comment.service';

import { ApiResponse } from '@common/response/common.response';

@ApiTags('Comment')
@Controller('users/:userId/comments')
export class UserCommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiGetUserComments()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserComments(
    @Param() paramDto: GetUserCommentsParamRequestDto,
    @Query() queryDto: GetUserCommentsRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '유저 댓글 조회를 성공했습니다.',
      await this.commentService.getCommentsByUser(paramDto.userId, queryDto),
    );
  }
}
