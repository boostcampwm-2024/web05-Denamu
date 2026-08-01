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
import { CommentParamRequestDto } from '@comment/dto/request/commentParam.dto';
import { CreateCommentRequestDto } from '@comment/dto/request/createComment.dto';
import { GetCommentRequestDto } from '@comment/dto/request/getComment.dto';
import { UpdateCommentRequestDto } from '@comment/dto/request/updateComment.dto';
import { CommentService } from '@comment/service/comment.service';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, OptionalJwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

@ApiTags('Comment')
@Controller('feeds/:feedId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiGetComment()
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtGuard)
  async getComment(
    @CurrentUser() user: Payload | null,
    @Param() feedDto: GetCommentRequestDto,
  ) {
    return ApiResponse.responseWithData(
      '댓글 조회를 성공했습니다.',
      await this.commentService.get(feedDto, user),
    );
  }

  @ApiCreateComment()
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @CurrentUser() user: Payload,
    @Param() feedDto: GetCommentRequestDto,
    @Body() commentDto: CreateCommentRequestDto,
  ) {
    await this.commentService.create(user, feedDto.feedId, commentDto);
    return ApiResponse.responseWithNoContent('댓글 등록을 성공했습니다.');
  }

  @ApiUpdateComment()
  @Patch(':commentId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateComment(
    @CurrentUser() user: Payload,
    @Param() paramDto: CommentParamRequestDto,
    @Body() bodyDto: UpdateCommentRequestDto,
  ) {
    await this.commentService.update(user, paramDto.commentId, bodyDto);
    return ApiResponse.responseWithNoContent('댓글 수정을 성공했습니다.');
  }

  @ApiDeleteComment()
  @Delete(':commentId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(
    @CurrentUser() user: Payload,
    @Param() paramDto: CommentParamRequestDto,
  ) {
    await this.commentService.delete(user, paramDto);
    return ApiResponse.responseWithNoContent('댓글 삭제를 성공했습니다.');
  }
}
