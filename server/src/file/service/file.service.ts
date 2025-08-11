import { Injectable, NotFoundException } from '@nestjs/common';
import { File } from '../entity/file.entity';
import { unlinkSync, existsSync } from 'fs';
import { FileRepository } from '../repository/file.repository';
import { User } from '../../user/entity/user.entity';
import { FileUploadResponseDto } from '../dto/createFile.dto';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async create(file: any, userId: number): Promise<FileUploadResponseDto> {
    const { originalName, mimetype, size, path } = file;

    const savedFile = await this.fileRepository.save({
      originalName,
      mimetype,
      size,
      path,
      user: { id: userId } as User,
    } as File);
    const accessUrl = this.generateAccessUrl(path);

    return {
      id: savedFile.id,
      originalName: savedFile.originalName,
      mimetype: savedFile.mimetype,
      size: savedFile.size,
      url: accessUrl,
      userId: userId,
      createdAt: savedFile.createdAt,
    };
  }

  private generateAccessUrl(filePath: string): string {
    const baseUploadPath =
      process.env.UPLOAD_BASE_PATH || '/var/web05-Denamu/objects';
    const relativePath = filePath.replace(baseUploadPath, '');
    return `/objects${relativePath}`;
  }

  async findById(id: number): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    const file = await this.findById(id);

    if (existsSync(file.path)) {
      unlinkSync(file.path);
    }

    await this.fileRepository.delete(id);
  }

  async getFileInfo(id: number): Promise<File> {
    return this.findById(id);
  }
}
