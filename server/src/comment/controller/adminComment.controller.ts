import { Controller, Delete, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiDeleteCommentByAdmin } from '@comment/api-docs/deleteCommentByAdmin.api-docs';
import { CommentParamRequestDto } from '@comment/dto/request/commentParam.dto';
import { CommentService } from '@comment/service/comment.service';

import { AdminAuthGuard } from '@common/guard/session.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Admin')
@Controller('admins/comments')
export class AdminCommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiDeleteCommentByAdmin()
  @Delete(':commentId')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param() paramDto: CommentParamRequestDto) {
    await this.commentService.deleteByAdmin(paramDto.commentId);
    return ApiResponse.responseWithNoContent('댓글 삭제를 성공했습니다.');
  }
}
