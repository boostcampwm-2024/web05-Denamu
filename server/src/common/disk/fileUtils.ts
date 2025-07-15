import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// TODO: 테스트 후 기본 경로 제거 하기.
const BASE_UPLOAD_PATH =
  process.env.UPLOAD_BASE_PATH || '/var/web05-Denamu/objects';

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
