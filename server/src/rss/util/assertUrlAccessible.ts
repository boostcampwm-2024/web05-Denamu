import { BadRequestException, NotFoundException } from '@nestjs/common';

import axios from 'axios';

export async function assertUrlAccessible(url: string) {
  try {
    await axios.get(url, {
      timeout: 5000,
      maxRedirects: 5,
      maxContentLength: 5 * 1024 * 1024,
    });
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    if (status === 404) {
      throw new NotFoundException(
        `${url}을(를) 찾을 수 없습니다. 올바른 블로그 주소를 입력해주세요.`,
      );
    }

    throw new BadRequestException(
      `${url}에 접속할 수 없습니다. 올바른 블로그 주소를 입력해주세요.`,
    );
  }
}
