import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UploadFileQueryRequestDto } from '../../../src/file/dto/request/uploadFile.dto';
import {
  FILE_SIZE_LIMITS,
  FileUploadType,
} from '../../../src/file/constant/file.constant';
import { User } from '../../../src/user/entity/user.entity';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import TestAgent from 'supertest/lib/agent';
import { FileRepository } from '../../../src/file/repository/file.repository';
import { createAccessToken } from '../../config/e2e/env/jest.setup';
import * as fs from 'fs/promises';
import * as uuid from 'uuid';

const URL = '/api/file';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let fileRepository: FileRepository;
  const fileRandomName = 'test-random-uuid-file-name';

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    fileRepository = app.get(FileRepository);
    const userRepository = app.get(UserRepository);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  beforeEach(() => {
    jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    jest.spyOn(uuid, 'v4').mockReturnValue(fileRandomName as any);
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
  });

  it('[400] 파일이 포함되어 있지 않을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });
    const accessToken = createAccessToken(user);

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
    const savedFile = await fileRepository.findOneBy({
      originalName: 'test.png',
      mimetype: 'image/png',
    });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });

  it('[400] 파일 타입이 일치하지 않을 경우 파일 업로드를 실패한다. ', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    const accessToken = createAccessToken(user);

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
    const savedFile = await fileRepository.findOneBy({
      originalName: 'test.txt',
      mimetype: 'text/plain',
    });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });
  it('[400] 파일 크기가 일치하지 않을 경우 파일 업로드를 실패한다. ', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    const accessToken = createAccessToken(user);

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
    const savedFile = await fileRepository.findOneBy({
      originalName: 'test.png',
      mimetype: 'image/png',
    });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });

  it('[201] 파일을 포함할 경우 파일 업로드를 성공한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    const accessToken = createAccessToken(user);

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.alloc(1024, 0), 'test.png');

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toStrictEqual({
      id: expect.any(Number),
      originalName: 'test.png',
      mimetype: 'image/png',
      size: 1024,
      url: expect.stringContaining(fileRandomName),
      userId: user.id,
      createdAt: expect.any(String),
    });

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      originalName: 'test.png',
      mimetype: 'image/png',
    });

    // DB, Redis then
    expect(savedFile).not.toBeNull();

    // cleanup
    await fileRepository.delete({ user });
  });
});
