import { diskStorage } from 'multer';
import { createDirectoryIfNotExists, getFileName } from './fileUtils';
import {
  validateFile,
  ALLOWED_MIME_TYPES,
  FILE_SIZE_LIMITS,
  FileUploadType,
} from './fileValidator';

export const createDynamicStorage = () => {
  return {
    storage: diskStorage({
      destination: (req: any, file, cb) => {
        const uploadType: FileUploadType =
          // TODO: 파일 업로드 타입 추론부 확정나면 변경하기
          req.body?.uploadType ||
          req.query?.uploadType ||
          req.uploadType ||
          'PROFILE_IMAGE';

        const uploadPath = createDirectoryIfNotExists(uploadType);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, getFileName(file));
      },
    }),
    fileFilter: (req: any, file: any, cb: any) => {
      try {
        const uploadType: FileUploadType =
          req.body?.uploadType ||
          req.query?.uploadType ||
          req.uploadType ||
          'PROFILE_IMAGE';

        // uploadType에 따른 허용 타입 결정
        let allowedTypes: string[] = [];
        if (uploadType === 'PROFILE_IMAGE') {
          allowedTypes = ALLOWED_MIME_TYPES.IMAGE;
        } // else if 로 업로드 타입별 허용 MIME TYPE 결정 구문 추가 하기

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
