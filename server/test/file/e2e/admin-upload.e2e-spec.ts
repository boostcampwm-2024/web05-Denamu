import { HttpStatus } from '@nestjs/common';

import * as uuid from 'uuid';
import fs from 'fs/promises';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { FILE_SIZE_LIMITS, FileUploadType } from '@file/constant/file.constant';
import { FileRepository } from '@file/repository/file.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/images';

// 100x100 단색 PNG: webp 변환 시 원본보다 확실히 작아지는 케이스 (353B -> 106B)
const PNG_FIXTURE_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABE0lEQVR4nO3WUQ0DAQzD0CExfygHaxTuZ0onPakILCfN5yn3vIPwQep5rQtYgdUvEsOswIpZbd+RGAZWzEoM+5dhrLMCK2Ylhs3LSGcFVsxqHjHTIbBiVvfPgg+smJUYNi8jnRVYMat5xEyHwIpZ3T8LPrBiVmLYvIx0VmDFrOYRMx0CK2Z1/yz4wIpZiWHzMtJZgRWzmkfMdAismNX9s+ADK2Ylhs3LSGcFVsxqHjHTIbBiVvfPgg+smJUYNi8jnRVYMat5xEyHwIpZ3T8LPrBiVmLYvIx0VmDFrOYRMx0CK2Z1/yz4wIpZiWHzMtJZgRWzmkfMdAismNX9s+ADK2Ylhs3LSGcFVsxqHjHTIbBamfUFgy2uiqggRS0AAAAASUVORK5CYII=',
  'base64',
);

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let fileRepository: FileRepository;

  const sessionKey = 'admin-image-upload-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;
  const fileRandomName = 'test-random-uuid-file-name';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    fileRepository = testApp.get(FileRepository);
  });

  beforeEach(async () => {
    jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    jest.spyOn(uuid, 'v4').mockReturnValue(fileRandomName as any);

    const admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 이미지 업로드를 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.BOARD_IMAGE })
      .attach('file', PNG_FIXTURE_BUFFER, 'test.png');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB then
    expect(await fileRepository.count()).toBe(0);
  });

  it('[201] 게시글 이미지 타입으로 파일을 첨부할 경우 이미지 업로드를 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.BOARD_IMAGE })
      .set('Cookie', `sessionId=${sessionKey}`)
      .attach('file', PNG_FIXTURE_BUFFER, 'test.png');

    // Http then
    const { message, data } = response.body as {
      message: string;
      data: { url: string };
    };
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(message).toBe('이미지 업로드에 성공했습니다.');
    expect(data).toStrictEqual({
      url: expect.stringContaining(`${fileRandomName}.webp`),
    });
    expect(data.url).toContain(FileUploadType.BOARD_IMAGE);

    // DB then
    expect(await fileRepository.count()).toBe(0);
  });

  it('[201] 마케팅 이메일 이미지 타입으로 파일을 첨부할 경우 이미지 업로드를 성공한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.MARKETING_EMAIL_IMAGE })
      .set('Cookie', `sessionId=${sessionKey}`)
      .attach('file', PNG_FIXTURE_BUFFER, 'test.png');

    // Http then
    const { data } = response.body as { data: { url: string } };
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data.url).toContain(FileUploadType.MARKETING_EMAIL_IMAGE);

    // DB then
    expect(await fileRepository.count()).toBe(0);
  });

  it('[400] 이미지 타입이 관리자 업로드 허용 목록에 없을 경우 이미지 업로드를 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.PROFILE_IMAGE })
      .set('Cookie', `sessionId=${sessionKey}`)
      .attach('file', PNG_FIXTURE_BUFFER, 'test.png');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[400] 파일이 포함되어 있지 않을 경우 이미지 업로드를 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.BOARD_IMAGE })
      .set('Cookie', `sessionId=${sessionKey}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[400] 파일 타입이 이미지가 아닐 경우 이미지 업로드를 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.BOARD_IMAGE })
      .set('Cookie', `sessionId=${sessionKey}`)
      .attach('file', Buffer.alloc(1024, 0), 'test.txt');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[400] 파일 크기가 제한을 초과할 경우 이미지 업로드를 실패한다.', async () => {
    // Http when
    const response = await agent
      .post(URL)
      .query({ uploadType: FileUploadType.BOARD_IMAGE })
      .set('Cookie', `sessionId=${sessionKey}`)
      .attach('file', Buffer.alloc(FILE_SIZE_LIMITS.IMAGE + 1, 0), 'test.png');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });
});
