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
import { ALLOWED_MIME_TYPES } from '../../common/disk/fileValidation';
import { createDynamicStorage } from '../../common/disk/diskStorage';
import { ApiResponse } from '../../common/response/common.response';

@ApiTags('File')
@Controller('file')
@UseGuards(JwtGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload/profile')
  @UseInterceptors(FileInterceptor('file', { storage: createDynamicStorage }))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req) {
    req.uploadType = 'PROFILE_IMAGE';
    const resultFile = await this.handleFileUpload(file, req);

    return ApiResponse.responseWithData('파일 업로드에 성공했습니다.', {
      resultFile,
    });
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Req() req) {
    await this.fileService.deleteFile(id, req.user.id);
    return { message: '파일이 성공적으로 삭제되었습니다.' };
  }

  private async handleFileUpload(file: Express.Multer.File, req: any) {
    if (!file) {
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    if (!ALLOWED_MIME_TYPES[req.uploadType].includes(file.mimetype)) {
      throw new BadRequestException(
        `허용된 파일 타입이 아닙니다. 허용된 파일 타입 ${ALLOWED_MIME_TYPES[req.uploadType].join(', ')}`,
      );
    }

    return this.fileService.create(file, Number.parseInt(req.user.id));
  }
}
