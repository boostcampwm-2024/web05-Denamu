import { BadRequestException } from '@nestjs/common';

export function validateWindow(startAt: Date | null, endAt: Date | null) {
  if (startAt && endAt && startAt.getTime() >= endAt.getTime()) {
    throw new BadRequestException(
      '노출 시작일은 종료일보다 이전이어야 합니다.',
    );
  }
}
