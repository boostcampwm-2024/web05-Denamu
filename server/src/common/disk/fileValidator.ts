import { BadRequestException } from '@nestjs/common';

export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALL: [] as string[],
};

export const FILE_UPLOAD_TYPE = {
  PROFILE_IMAGE: 'profileImg',
} as const;

export type FileUploadType = keyof typeof FILE_UPLOAD_TYPE;

ALLOWED_MIME_TYPES.ALL = [...ALLOWED_MIME_TYPES.IMAGE];

export const FILE_SIZE_LIMITS = {
  // MB 단위
  IMAGE: 5 * 1024 * 1024,
  DEFAULT: 10 * 1024 * 1024,
};

export const validateFile = (file: any, uploadType: string) => {
  let allowedTypes: string[] = [];
  if (uploadType === 'PROFILE_IMAGE') {
    allowedTypes = ALLOWED_MIME_TYPES.IMAGE;
  }

  validateFileType(file, allowedTypes);
  validateFileSize(file, uploadType);
};

const validateFileType = (file: any, allowedTypes?: string[]) => {
  const types = allowedTypes || [];

  if (!types.includes(file.mimetype)) {
    throw new BadRequestException(
      `지원하지 않는 파일 형식입니다. 지원 형식: ${types.join(', ')}`,
    );
  }
};

const validateFileSize = (file: any, uploadType: string) => {
  let sizeLimit: number;

  if (uploadType === 'PROFILE_IMAGE') {
    sizeLimit = FILE_SIZE_LIMITS.IMAGE;
  } else {
    sizeLimit = FILE_SIZE_LIMITS.DEFAULT;
  }

  if (file.size > sizeLimit) {
    throw new BadRequestException(
      `파일 크기가 너무 큽니다. 최대 ${Math.round(sizeLimit / 1024 / 1024)}MB까지 허용됩니다.`,
    );
  }
};
