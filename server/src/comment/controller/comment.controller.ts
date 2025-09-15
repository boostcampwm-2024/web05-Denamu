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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentService } from '../service/comment.service';
import { ApiCreateComment } from '../api-docs/createComment.api-docs';
import { ApiDeleteComment } from '../api-docs/deleteComment.api-docs';
import { ApiUpdateComment } from '../api-docs/updateComment.api-docs';
import { JwtGuard } from '../../common/guard/jwt.guard';
import { ApiResponse } from '../../common/response/common.response';
import { CreateCommentRequestDto } from '../dto/request/createComment.dto';
import { DeleteCommentRequestDto } from '../dto/request/deleteComment.dto';
import { UpdateCommentRequestDto } from '../dto/request/updateComment.dto';
import { GetCommentRequestDto } from '../dto/request/getComment.dto';
import { ApiGetComment } from '../api-docs/getComment.api-docs';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiGetComment()
  @Get('/:feedId')
  @HttpCode(HttpStatus.OK)
  async getComment(@Param() getCommentRequestDto: GetCommentRequestDto) {
    return ApiResponse.responseWithData(
      '댓글 조회를 성공했습니다.',
      await this.commentService.get(getCommentRequestDto),
    );
  }

  @ApiCreateComment()
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComment(@Req() req, @Body() commentDto: CreateCommentRequestDto) {
    await this.commentService.create(req.user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 등록을 성공했습니다.');
  }

  @ApiDeleteComment()
  @Delete()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Req() req, @Body() commentDto: DeleteCommentRequestDto) {
    await this.commentService.delete(req.user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 삭제를 성공했습니다.');
  }

  @ApiUpdateComment()
  @Patch()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async updateComment(@Req() req, @Body() commentDto: UpdateCommentRequestDto) {
    await this.commentService.update(req.user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 수정을 성공했습니다.');
  }
}
