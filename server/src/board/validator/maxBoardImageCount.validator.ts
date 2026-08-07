import { MAX_BOARD_IMAGE_COUNT } from '@board/constant/board.constant';
import { extractBoardImageUrls } from '@board/util/extractBoardImageUrls';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function MaxBoardImageCount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxBoardImageCount',
      target: object.constructor,
      propertyName,
      options: {
        message: `이미지는 최대 ${MAX_BOARD_IMAGE_COUNT}장까지 첨부할 수 있습니다.`,
        ...validationOptions,
      },
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' &&
            extractBoardImageUrls(value).length <= MAX_BOARD_IMAGE_COUNT
          );
        },
      },
    });
  };
}
