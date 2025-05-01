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
import { ApiWriteComment } from '../api-docs/writeComment.api-docs';
import { ApiRemoveComment } from '../api-docs/removeComment.api-docs';
import { ApiEditComment } from '../api-docs/editComment.api-docs';
import { JwtGuard } from '../../common/guard/jwt.guard';
import { ApiResponse } from '../../common/response/common.response';
import { WriteCommentRequestDto } from '../dto/request/write-comment.dto';
import { RemoveCommentRequestDto } from '../dto/request/remove-comment.dto';
import { EditCommentRequestDto } from '../dto/request/edit-comment.dto';

@ApiTags('Comment')
@Controller('comment')
@UseGuards(JwtGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiWriteComment()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async writeComment(@Req() req, @Body() commentDto: WriteCommentRequestDto) {
    await this.commentService.create(req.user, commentDto);
    return ApiResponse.responseWithNoContent('댓글 등록을 성공했습니다.');
  }

  @ApiRemoveComment()
  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeComment(@Req() req, @Body() commentDto: RemoveCommentRequestDto) {
    const userInformation = req.user;
    await this.commentService.commentCheck(
      userInformation,
      commentDto.commentId,
    );
    await this.commentService.remove(commentDto);
    return ApiResponse.responseWithNoContent('댓글 삭제를 성공했습니다.');
  }

  @ApiEditComment()
  @Patch()
  @HttpCode(HttpStatus.OK)
  async editComment(@Req() req, @Body() commentDto: EditCommentRequestDto) {
    const userInformation = req.user;
    await this.commentService.commentCheck(
      userInformation,
      commentDto.commentId,
    );
    await this.commentService.edit(commentDto);
    return ApiResponse.responseWithNoContent('댓글 수정을 성공했습니다.');
  }
}
