import { diskStorage } from 'multer';
import {
  createDirectoryIfNotExists,
  getFileName,
  validateAndGetUploadType,
} from './file-utils';
import { validateFile, FILE_SIZE_LIMITS } from './file-validator';

export const createDynamicStorage = () => {
  return {
    storage: diskStorage({
      destination: (req: any, file, cb) => {
        try {
          const uploadType = validateAndGetUploadType(req.query.uploadType);
          const uploadPath = createDirectoryIfNotExists(uploadType);
          cb(null, uploadPath);
        } catch (error) {
          cb(error, null);
        }
      },
      filename: (req, file, cb) => {
        cb(null, getFileName(file));
      },
    }),
    fileFilter: (req: any, file: any, cb: any) => {
      try {
        const uploadType = validateAndGetUploadType(req.query.uploadType);
        validateFile(file, uploadType);
        cb(null, true);
      } catch (error) {
        cb(error, false);
      }
    },
    limits: {
      fileSize: FILE_SIZE_LIMITS.IMAGE, // 기본적으로 이미지 크기 제한 사용
    },
  };
};

export const storage = createDynamicStorage();
