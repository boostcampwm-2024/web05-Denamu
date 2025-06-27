import { diskStorage } from 'multer';
import { join } from 'path';
import { ensureDirSync } from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

export const FILE_UPLOAD_PATHS = {
  PROFILE_IMAGE: 'profileImg',
} as const;

export type FileUploadType = keyof typeof FILE_UPLOAD_PATHS;

// TODO: 테스트 후 기본 경로 제거 하기.
const BASE_UPLOAD_PATH =
  process.env.UPLOAD_BASE_PATH || '/var/web05-Denamu/objects';

export const createDynamicStorage = () => {
  return diskStorage({
    destination: (req: any, file, cb) => {
      const uploadType: FileUploadType =
        // TODO: Type 전달 방법 픽스되면 타입 추출부분 정리하기
        req.body?.uploadType ||
        req.query?.uploadType ||
        req.uploadType ||
        'PROFILE_IMAGE';

      const now = new Date();
      const dateFolder = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

      const uploadPath = join(
        BASE_UPLOAD_PATH,
        FILE_UPLOAD_PATHS[uploadType],
        dateFolder,
      );

      ensureDirSync(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `${uuidv4()}.${ext}`);
    },
  });
};

export const storage = createDynamicStorage();
