import { HttpStatus } from '@nestjs/common';

import * as uuid from 'uuid';
import fs from 'fs/promises';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { FILE_SIZE_LIMITS, FileUploadType } from '@file/constant/file.constant';
import { UploadFileQueryRequestDto } from '@file/dto/request/uploadFile.dto';
import { FileRepository } from '@file/repository/file.repository';

import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/files';

// 100x100 단색 PNG: webp 변환 시 원본보다 확실히 작아지는 케이스 (353B -> 106B)
const PNG_FIXTURE_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAACXBIWXMAAAPoAAAD6AG1e1JrAAABE0lEQVR4nO3WUQ0DAQzD0CExfygHaxTuZ0onPakILCfN5yn3vIPwQep5rQtYgdUvEsOswIpZbd+RGAZWzEoM+5dhrLMCK2Ylhs3LSGcFVsxqHjHTIbBiVvfPgg+smJUYNi8jnRVYMat5xEyHwIpZ3T8LPrBiVmLYvIx0VmDFrOYRMx0CK2Z1/yz4wIpZiWHzMtJZgRWzmkfMdAismNX9s+ADK2Ylhs3LSGcFVsxqHjHTIbBiVvfPgg+smJUYNi8jnRVYMat5xEyHwIpZ3T8LPrBiVmLYvIx0VmDFrOYRMx0CK2Z1/yz4wIpZiWHzMtJZgRWzmkfMdAismNX9s+ADK2Ylhs3LSGcFVsxqHjHTIbBamfUFgy2uiqggRS0AAAAASUVORK5CYII=',
  'base64',
);

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let user: User;
  let fileRepository: FileRepository;
  let userRepository: UserRepository;
  let accessToken: string;
  const fileRandomName = 'test-random-uuid-file-name';

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    fileRepository = testApp.get(FileRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    jest.spyOn(uuid, 'v4').mockReturnValue(fileRandomName as any);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 인증되지 않은 사용자가 요청할 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // Http when
    const response = await agent.post(URL).query(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({ user: { id: user.id } });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });

  it('[400] 파일이 포함되어 있지 않을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({ user: { id: user.id } });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });

  it('[400] 파일 타입이 일치하지 않을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.alloc(1024, 0), 'test.txt');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({ user: { id: user.id } });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });
  it('[400] 파일 크기가 일치하지 않을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.alloc(FILE_SIZE_LIMITS.IMAGE + 1, 0), 'test.png');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({ user: { id: user.id } });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });

  it('[201] 파일을 포함할 경우 파일 업로드를 성공한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_FIXTURE_BUFFER, 'test.png');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toStrictEqual({
      id: expect.any(Number),
      originalName: 'test.png',
      mimetype: 'image/webp',
      size: expect.any(Number),
      url: expect.stringContaining(`${fileRandomName}.webp`),
      userId: user.id,
      createdAt: expect.any(String),
    });

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      originalName: 'test.png',
      mimetype: 'image/webp',
    });

    // DB, Redis then
    expect(savedFile).not.toBeNull();
  });
});
