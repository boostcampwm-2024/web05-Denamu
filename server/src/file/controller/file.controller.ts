import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  UseGuards,
  BadRequestException,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../service/file.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard, Payload } from '../../common/guard/jwt.guard';
import { createDynamicStorage } from '../../common/disk/diskStorage';
import { ApiResponse } from '../../common/response/common.response';
import { ApiUploadProfileFile } from '../api-docs/uploadProfileFile.api-docs';
import { ApiDeleteFile } from '../api-docs/deleteFile.api-docs';
import { DeleteFileRequestDto } from '../dto/request/deleteFile.dto';
import { UploadFileQueryDto } from '../dto/request/uploadFile.dto';
import { CurrentUser } from '../../common/decorator';

@ApiTags('File')
@Controller('file')
@UseGuards(JwtGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('')
  @ApiUploadProfileFile()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', createDynamicStorage()))
  async upload(
    @UploadedFile() file: any,
    @Query() query: UploadFileQueryDto,
    @CurrentUser() user: Payload,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    return ApiResponse.responseWithData(
      '파일 업로드에 성공했습니다.',
      await this.fileService.create(file, user.id),
    );
  }

  // TODO: 권한검사 추가
  @Delete(':id')
  @ApiDeleteFile()
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param() fileDeleteRequestDto: DeleteFileRequestDto) {
    await this.fileService.deleteFile(fileDeleteRequestDto.id);
    return ApiResponse.responseWithNoContent(
      '파일이 성공적으로 삭제되었습니다.',
    );
  }
}
