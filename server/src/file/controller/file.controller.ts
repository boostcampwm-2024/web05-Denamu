import {
  Controller,
  Delete,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorator';
import { JwtGuard, Payload } from '@common/guard/jwt.guard';
import { ApiResponse } from '@common/response/common.response';

import { ApiDeleteFile } from '@file/api-docs/deleteFile.api-docs';
import { ApiUploadProfileFile } from '@file/api-docs/uploadProfileFile.api-docs';
import { FILE_SIZE_LIMITS } from '@file/constant/file.constant';
import { DeleteFileParamRequestDto } from '@file/dto/request/deleteFile.dto';
import { UploadFileQueryRequestDto } from '@file/dto/request/uploadFile.dto';
import { FileService } from '@file/service/file.service';

@ApiTags('File')
@Controller('files')
@UseGuards(JwtGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('')
  @ApiUploadProfileFile()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: FILE_SIZE_LIMITS.IMAGE,
            errorMessage(ctx) {
              return `파일 크기 제한을 넘었습니다. 파일 크기 제한: ${ctx.config.maxSize / (1024 * 1024)}MB, 업로드된 파일 크기: ${ctx.file?.size / (1024 * 1024)}MB`;
            },
          }),
          new FileTypeValidator({
            fileType: /image\/(png|jpg|jpeg|webp|gif)/,
            errorMessage(ctx) {
              return `지원하지 않는 파일 형식입니다. 지원 파일 형식: ${ctx.config.fileType}, 업로드된 파일 형식: ${ctx.file?.mimetype}`;
            },
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query() query: UploadFileQueryRequestDto,
    @CurrentUser() user: Payload,
  ) {
    return ApiResponse.responseWithData(
      '파일 업로드에 성공했습니다.',
      await this.fileService.handleUpload(file, query.uploadType, user.id),
    );
  }

  @Delete(':id')
  @ApiDeleteFile()
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Param() fileDeleteRequestDto: DeleteFileParamRequestDto,
    @CurrentUser() user: Payload,
  ) {
    await this.fileService.deleteFile(fileDeleteRequestDto.id, user.id);
    return ApiResponse.responseWithNoContent(
      '파일이 성공적으로 삭제되었습니다.',
    );
  }
}
