import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
import { FileUploadType } from './file-validator';

const BASE_UPLOAD_PATH = '/var/web05-Denamu/objects';

export const generateFilePath = (originalPath: string): string => {
  const now = new Date();
  const folder = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
  return join(originalPath, folder);
};

export const getFileName = (file: any): string => {
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  return `${uuidv4()}.${ext}`;
};

export const createDirectoryIfNotExists = (uploadType: string): string => {
  const now = new Date();
  const dateFolder = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  const uploadPath = join(BASE_UPLOAD_PATH, uploadType, dateFolder);

  ensureDirSync(uploadPath);
  return uploadPath;
};

export const deleteFileIfExists = async (filePath: string): Promise<void> => {
  if (existsSync(filePath)) {
    await fs.unlink(filePath);
  }
};

// Interceptor가 Pipes보다 먼저 실행되기에, 타입 유효성 검사 필요함
export const validateAndGetUploadType = (uploadType: any): FileUploadType => {
  if (!uploadType) {
    throw new BadRequestException(
      `uploadType이 필요합니다. 허용된 타입: ${Object.values(FileUploadType).join(', ')}`,
    );
  }

  if (!Object.values(FileUploadType).includes(uploadType)) {
    throw new BadRequestException(
      `유효하지 않은 파일 업로드 타입입니다. 허용된 타입: ${Object.values(FileUploadType).join(', ')}`,
    );
  }

  return uploadType as FileUploadType;
};
