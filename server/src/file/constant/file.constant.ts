export enum FileUploadType {
  PROFILE_IMAGE = 'PROFILE_IMAGE',
  BOARD_IMAGE = 'BOARD_IMAGE',
  // 추후 추가될 타입들 명시
}

export const FILE_SIZE_LIMITS = {
  // MB 단위
  IMAGE: 5 * 1024 * 1024,
  DEFAULT: 10 * 1024 * 1024,
};

export const IMAGE_WEBP_QUALITY = 80;
