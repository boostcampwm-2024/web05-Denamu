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
import { CommentService } from '@src/comment/service/comment.service';
import { ApiCreateComment } from '@src/comment/api-docs/createComment.api-docs';
import { ApiDeleteComment } from '@src/comment/api-docs/deleteComment.api-docs';
import { ApiUpdateComment } from '@src/comment/api-docs/updateComment.api-docs';
import { JwtGuard, Payload } from '@src/common/guard/jwt.guard';
import { ApiResponse } from '@src/common/response/common.response';
import { CreateCommentRequestDto } from '@src/comment/dto/request/createComment.dto';
import { DeleteCommentRequestDto } from '@src/comment/dto/request/deleteComment.dto';
import { UpdateCommentRequestDto } from '@src/comment/dto/request/updateComment.dto';
import { GetCommentRequestDto } from '@src/comment/dto/request/getComment.dto';
import { ApiGetComment } from '@src/comment/api-docs/getComment.api-docs';
import { CurrentUser } from '@src/common/decorator';

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
