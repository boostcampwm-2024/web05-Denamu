import { join } from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

export const generateFilePath = (originalPath: string): string => {
  const now = new Date();
  const folder = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
  return join(originalPath, folder);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

export const createDirectoryIfNotExists = async (
  dirPath: string,
): Promise<void> => {
  if (!existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

export const deleteFileIfExists = async (filePath: string): Promise<void> => {
  if (existsSync(filePath)) {
    await fs.unlink(filePath);
  }
};
