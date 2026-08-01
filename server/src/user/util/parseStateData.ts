import { BadRequestException } from '@nestjs/common';

import { StateData } from '@user/constant/oauth.constant';

export function parseStateData(stateString: string): StateData {
  try {
    return JSON.parse(Buffer.from(stateString, 'base64').toString());
  } catch {
    throw new BadRequestException('잘못된 state 형식입니다.');
  }
}
