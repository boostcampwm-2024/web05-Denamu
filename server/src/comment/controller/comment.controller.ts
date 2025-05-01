import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
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
import { CreateCommentRequestDto } from '../dto/request/create-comment.dto';
import { DeleteCommentRequestDto } from '../dto/request/delete-comment.dto';
import { UpdateCommentRequestDto } from '../dto/request/update-comment.dto';

@ApiTags('Comment')
@Controller('comment')
@UseGuards(JwtGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiCreateComment()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComment(@Req() req, @Body() commentDto: CreateCommentRequestDto) {
    await this.commentService.create(req.user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 등록을 성공했습니다.');
  }

  @ApiDeleteComment()
  @Delete()
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Req() req, @Body() commentDto: DeleteCommentRequestDto) {
    await this.commentService.commentCheck(req.user, commentDto.commentId);
    await this.commentService.delete(commentDto);
    return ApiResponse.responseWithNoContent('댓글 삭제를 성공했습니다.');
  }

  @ApiUpdateComment()
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateComment(@Req() req, @Body() commentDto: UpdateCommentRequestDto) {
    await this.commentService.commentCheck(req.user, commentDto.commentId);
    await this.commentService.update(commentDto);
    return ApiResponse.responseWithNoContent('댓글 수정을 성공했습니다.');
  }
}
