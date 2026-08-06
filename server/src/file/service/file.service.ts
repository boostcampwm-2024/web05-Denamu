import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import * as fs from 'fs/promises';
import * as path from 'path';
import * as uuid from 'uuid';
import { access, unlink } from 'fs/promises';
import sharp from 'sharp';

import { WinstonLoggerService } from '@common/logger/logger.service';

import {
  FileUploadType,
  IMAGE_WEBP_QUALITY,
} from '@file/constant/file.constant';
import { UploadFileResponseDto } from '@file/dto/response/uploadFile.dto';
import { File } from '@file/entity/file.entity';
import { FileRepository } from '@file/repository/file.repository';

@Injectable()
export class FileService {
  private readonly basePath = '/app/objects';

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  async handleUpload(
    file: Express.Multer.File,
    uploadType: FileUploadType,
    userId: number,
  ) {
    const { filePath, mimetype, size } = await this.writeToDisk(
      file,
      uploadType,
    );

    const savedFile = await this.fileRepository.save({
      originalName: file.originalname,
      mimetype,
      size,
      path: filePath,
      user: { id: userId },
    });
    const accessUrl = this.generateAccessUrl(filePath);

    return UploadFileResponseDto.toResponseDto(savedFile, accessUrl);
  }

  async saveWithoutOwner(
    file: Express.Multer.File,
    uploadType: FileUploadType,
  ): Promise<string> {
    const { filePath } = await this.writeToDisk(file, uploadType);
    return this.generateAccessUrl(filePath);
  }

  private async writeToDisk(
    file: Express.Multer.File,
    uploadType: FileUploadType,
  ) {
    const today = this.getDateString();
    const targetDir = path.join(this.basePath, uploadType, today);

    await this.ensureDirectory(targetDir);

    const webpBuffer = await this.convertToWebp(file.buffer);
    const useWebp = webpBuffer.length < file.buffer.length;

    const buffer = useWebp ? webpBuffer : file.buffer;
    const ext = useWebp ? '.webp' : path.extname(file.originalname);
    const mimetype = useWebp ? 'image/webp' : file.mimetype;

    const fileName = `${uuid.v4()}${ext}`;
    const filePath = path.join(targetDir, fileName);

    await fs.writeFile(filePath, buffer);

    return { filePath, mimetype, size: buffer.length };
  }

  private async convertToWebp(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer, { animated: true })
        .webp({ quality: IMAGE_WEBP_QUALITY })
        .toBuffer();
    } catch {
      throw new BadRequestException('올바르지 않은 이미지 파일입니다.');
    }
  }

  private async ensureDirectory(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  get objectsBasePath(): string {
    return this.basePath;
  }

  toAccessUrl(internalPath: string): string {
    return this.generateAccessUrl(internalPath);
  }

  private generateAccessUrl(filePath: string): string {
    return filePath.replace(this.basePath, '/objects');
  }

  private resolveInternalPath(accessUrl: string): string {
    return accessUrl.startsWith('/objects')
      ? accessUrl.replace('/objects', this.basePath)
      : accessUrl;
  }

  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    return file;
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    const file = await this.findById(id);

    if (file.user.id !== userId) {
      throw new ForbiddenException('파일 삭제 권한이 없습니다.');
    }

    try {
      await access(file.path);
      await unlink(file.path);
    } catch {
      this.logger.warn(`파일 삭제 실패: ${file.path}`, 'FileService');
    }

    await this.fileRepository.delete(id);
  }

  async getFileInfo(id: number): Promise<File> {
    return this.findById(id);
  }

  async deleteUntracked(accessUrl: string): Promise<void> {
    const filePath = this.resolveInternalPath(accessUrl);
    try {
      await access(filePath);
      await unlink(filePath);
    } catch {
      this.logger.warn(`파일 삭제 실패: ${filePath}`, 'FileService');
    }
  }

  async deleteByPath(accessUrl: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { path: this.resolveInternalPath(accessUrl) },
    });
    if (!file) {
      return;
    }

    try {
      await access(file.path);
      await unlink(file.path);
    } catch {
      this.logger.warn(`파일 삭제 실패: ${file.path}`, 'FileService');
    }

    await this.fileRepository.delete(file.id);
  }
}
