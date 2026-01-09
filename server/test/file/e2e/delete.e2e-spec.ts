import { HttpStatus } from '@nestjs/common';
import supertest from 'supertest';
import { UserRepository } from '@src/user/repository/user.repository';
import { User } from '@src/user/entity/user.entity';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { FileRepository } from '@src/file/repository/file.repository';
import { File } from '@src/file/entity/file.entity';
import { FileFixture } from '@test/config/common/fixture/file.fixture';
import TestAgent from 'supertest/lib/agent';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';
import fs from 'fs/promises';

const URL = '/api/file';

describe(`DELETE ${URL}/{fileId} E2E Test`, () => {
  let agent: TestAgent;
  let user: User;
  let fileRepository: FileRepository;
  let file: File;
  let userRepository: UserRepository;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    fileRepository = testApp.get(FileRepository);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    file = await fileRepository.save(FileFixture.createFileFixture({ user }));
    accessToken = createAccessToken(user);
  });

  it('[401] 파일에 삭제 권한이 없을 경우 파일 삭제를 실패한다.', async () => {
    // Http when
    const response = await agent.delete(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      id: file.id,
    });

    // DB, Redis then
    expect(savedFile).not.toBeNull();
  });

  it('[404] 파일이 서비스에 존재하지 않을 경우 파일 삭제를 실패한다.', async () => {
    // given
    jest.spyOn(fs, 'access').mockResolvedValue(undefined);
    jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

    // Http when
    const response = await agent
      .delete(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      id: file.id,
    });

    // DB, Redis then
    expect(savedFile).not.toBeNull();
  });

  it('[200] DB에서 파일을 삭제했지만 FS 라이브러리의 삭제 문제일 경우에 서비스에서 파일 삭제를 성공한다.', async () => {
    // given
    jest
      .spyOn(fs, 'unlink')
      .mockRejectedValue(new Error('EACCES: permission denied'));

    // Http when
    const response = await agent
      .delete(`${URL}/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      id: file.id,
    });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });
  it('[200] DB에서 파일을 삭제했지만 FS 라이브러리의 접근 문제일 경우 서비스에서 파일 삭제를 성공한다.', async () => {
    // given
    jest
      .spyOn(fs, 'access')
      .mockRejectedValue(new Error('EACCES: permission denied'));

    // Http when
    const response = await agent
      .delete(`${URL}/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      id: file.id,
    });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });

  it('[200] 파일 삭제 요청을 받을 경우 파일 삭제를 성공한다.', async () => {
    // given
    jest.spyOn(fs, 'access').mockResolvedValue(undefined);
    jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

    // Http when
    const response = await agent
      .delete(`${URL}/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedFile = await fileRepository.findOneBy({
      id: file.id,
    });

    // DB, Redis then
    expect(savedFile).toBeNull();
  });
});
