import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { User } from '../../../src/user/entity/user.entity';
import { UserFixture } from '../../fixture/user.fixture';
import { FileRepository } from '../../../src/file/repository/file.repository';
import { File } from '../../../src/file/entity/file.entity';
import { FileFixture } from '../../fixture/file.fixture';
import TestAgent from 'supertest/lib/agent';

const URL = '/api/file';

describe(`DELETE ${URL}/{fileId} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let userService: UserService;
  let fileRepository: FileRepository;
  let file: File;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    const userRepository = app.get(UserRepository);
    userService = app.get(UserService);
    fileRepository = app.get(FileRepository);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[401] 파일에 삭제 권한이 없을 경우 파일 삭제를 실패한다.', async () => {
    // when
    const response = await agent.delete(`${URL}/${Number.MAX_SAFE_INTEGER}`);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 파일이 서비스에 존재하지 않을 경우 파일 삭제를 실패한다.', async () => {
    // given
    jest.mock('fs/promises', () => ({
      access: jest.fn().mockResolvedValue(null),
      unlink: jest.fn().mockResolvedValue(null),
    }));
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .delete(`${URL}/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('[200] DB에서 파일을 삭제했지만 FS 라이브러리릍 통해서 실패했을 경우에 서비스에서 파일 삭제를 성공한다.', async () => {
    // given
    file = await fileRepository.save(
      FileFixture.createFileFixture({ user: user }),
    );
    jest.mock('fs/promises', () => ({
      access: jest.fn().mockResolvedValue(null),
    }));

    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .delete(`${URL}/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] DB에서 파일을 삭제했지만 FS 라이브러리에서 권한 문제일 경우 서비스에서 파일 삭제를 성공한다.', async () => {
    // given
    file = await fileRepository.save(
      FileFixture.createFileFixture({ user: user }),
    );
    jest.mock('fs/promises', () => ({
      unlink: jest.fn().mockResolvedValue(null),
    }));
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .delete(`${URL}/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] 파일 삭제 요청을 받을 경우 파일 삭제를 성공한다.', async () => {
    // given
    file = await fileRepository.save(
      FileFixture.createFileFixture({ user: user }),
    );
    jest.mock('fs/promises', () => ({
      access: jest.fn().mockResolvedValue(null),
      unlink: jest.fn().mockResolvedValue(null),
    }));

    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await agent
      .delete(`${URL}/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });
});
