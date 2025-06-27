import { BadRequestException } from '@nestjs/common';

export const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  // 필요한 파일 타입이 더 있다면 추가하기
  ALL: [] as string[],
};

ALLOWED_MIME_TYPES.ALL = [...ALLOWED_MIME_TYPES.IMAGE];

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DEFAULT: 10 * 1024 * 1024, // 10MB
};

export const validateFileType = (file: any, allowedTypes?: string[]) => {
  const types = allowedTypes || ALLOWED_MIME_TYPES.ALL;

  if (!types.includes(file.mimetype)) {
    throw new BadRequestException(
      `지원하지 않는 파일 형식입니다. 지원 형식: ${types.join(', ')}`,
    );
  }
};

export const validateFileSize = (file: any, maxSize?: number) => {
  const sizeLimit = maxSize || FILE_SIZE_LIMITS.DEFAULT;

  if (file.size > sizeLimit) {
    throw new BadRequestException(
      `파일 크기가 너무 큽니다. 최대 ${Math.round(sizeLimit / 1024 / 1024)}MB까지 허용됩니다.`,
    );
  }
};

export const getFileCategory = (mimeType: string): string => {
  if (ALLOWED_MIME_TYPES.IMAGE.includes(mimeType)) return 'image';
  return 'other';
};
