import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiCreateComment } from '@comment/api-docs/createComment.api-docs';
import { ApiDeleteComment } from '@comment/api-docs/deleteComment.api-docs';
import { ApiGetComment } from '@comment/api-docs/getComment.api-docs';
import { ApiUpdateComment } from '@comment/api-docs/updateComment.api-docs';
import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';
import { DeleteCommentRequestDto } from '@comment/dto/request/deleteComment.dto';
import { GetCommentRequestDto } from '@comment/dto/request/getComment.dto';
import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';
import { CommentService } from '@comment/service/comment.service';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiCreateComment()
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @CurrentUser() user: Payload,
    @Body() commentDto: CreateCommentRequestDto,
  ) {
    await this.commentService.create(user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 등록을 성공했습니다.');
  }

  @ApiDeleteComment()
  @Delete()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @CurrentUser() user: Payload,
    @Body() commentDto: DeleteCommentRequestDto,
  ) {
    await this.commentService.delete(user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 삭제를 성공했습니다.');
  }

  @ApiGetComment()
  @Get('/:feedId')
  @HttpCode(HttpStatus.OK)
  async getComment(@Param() getCommentRequestDto: GetCommentRequestDto) {
    return ApiResponse.responseWithData(
      '댓글 조회를 성공했습니다.',
      await this.commentService.get(getCommentRequestDto),
    );
  }

  @ApiUpdateComment()
  @Patch()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateComment(
    @CurrentUser() user: Payload,
    @Body() commentDto: UpdateCommentRequestDto,
  ) {
    await this.commentService.update(user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 수정을 성공했습니다.');
  }
}
