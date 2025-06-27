import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entity/file.entity';
import { unlinkSync, existsSync } from 'fs';
import { UserRepository } from '../../user/repository/user.repository';
import { FileRepository } from '../repository/file.repository';

@Injectable()
export class FileService {
  constructor(private readonly fileRepository: FileRepository) {}

  async create(file: any, userId: string) {
    const { originalname, filename, mimetype, size, path } = file;
    const entity = this.fileRepository.create({
      originalName: originalname,
      filename,
      mimeType: mimetype,
      size,
      path,
      uploadedBy: userId,
    });
    return this.fileRepository.save(entity);
  }

  async findById(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }
    return file;
  }

  async deleteFile(id: string, userId: string): Promise<void> {
    const file = await this.findById(id);

    if (file.user.id !== Number.parseInt(userId)) {
      throw new NotFoundException('파일을 삭제할 권한이 없습니다.');
    }

    if (existsSync(file.path)) {
      unlinkSync(file.path);
    }

    await this.fileRepository.delete(id);
  }

  async getFileInfo(id: string): Promise<FileEntity> {
    return this.findById(id);
  }
}
