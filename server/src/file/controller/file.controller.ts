import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '../service/file.service';

import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guard/jwt.guard';
import { createDynamicStorage } from '../../common/disk/diskStorage';
import { ApiResponse } from '../../common/response/common.response';

@ApiTags('File')
@Controller('file')
@UseGuards(JwtGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload/profile')
  @UseInterceptors(FileInterceptor('file', createDynamicStorage()))
  async upload(@UploadedFile() file: any, @Req() req) {
    if (!file) {
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    const resultFile = await this.fileService.create(
      file,
      Number.parseInt(req.user.id),
    );

    return ApiResponse.responseWithData('파일 업로드에 성공했습니다.', {
      resultFile,
    });
  }

  // TODO: 권한검사 추가
  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Req() req) {
    await this.fileService.deleteFile(id);
    return { message: '파일이 성공적으로 삭제되었습니다.' };
  }
}
