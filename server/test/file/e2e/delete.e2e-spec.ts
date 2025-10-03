import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { User } from '../../../src/user/entity/user.entity';
import { UserFixture } from '../../fixture/user.fixture';
import { FileRepository } from '../../../src/file/repository/file.repository';
import { File } from '../../../src/file/entity/file.entity';
import { FileFixture } from '../../fixture/file.fixture';

describe('DELETE /api/file/{fileId}', () => {
  let app: INestApplication;
  let testUser: User;
  let userService: UserService;
  let userRepository: UserRepository;
  let fileRepository: FileRepository;
  let file: File;

  beforeAll(async () => {
    app = global.testApp;
    userRepository = app.get(UserRepository);
    userService = app.get(UserService);
    fileRepository = app.get(FileRepository);
    testUser = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[200] fs 라이브러리 파일의 삭제에 실패했을 경우 오류를 발생하지 않는다.', async () => {
    // given
    file = await fileRepository.save(
      FileFixture.createFileFixture({ user: testUser }),
    );
    jest.mock('fs/promises', () => ({
      access: jest.fn().mockResolvedValue(null),
    }));

    const accessToken = userService.createToken(
      {
        id: testUser.id,
        email: testUser.email,
        userName: testUser.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await request(app.getHttpServer())
      .delete(`/api/file/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[200] fs 라이브러리 파일에 삭제 권한이 없을 경우 오류가 발생하지 않는다..', async () => {
    // given
    file = await fileRepository.save(
      FileFixture.createFileFixture({ user: testUser }),
    );
    jest.mock('fs/promises', () => ({
      unlink: jest.fn().mockResolvedValue(null),
    }));

    // when
    const response = await request(app.getHttpServer())
      .delete('/api/file/1')
      .send();

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[200] 파일을 삭제했을 경우 응답을 한다.', async () => {
    // given
    file = await fileRepository.save(
      FileFixture.createFileFixture({ user: testUser }),
    );
    jest.mock('fs/promises', () => ({
      access: jest.fn().mockResolvedValue(null),
      unlink: jest.fn().mockResolvedValue(null),
    }));

    const accessToken = userService.createToken(
      {
        id: testUser.id,
        email: testUser.email,
        userName: testUser.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await request(app.getHttpServer())
      .delete(`/api/file/${file.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    // then
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('[401] 파일에 삭제 권한이 없을 경우 권한 오류가 발생한다.', async () => {
    // when
    const response = await request(app.getHttpServer())
      .delete('/api/file/1')
      .send();

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[404] 파일이 없을 경우 응답을 한다.', async () => {
    jest.mock('fs/promises', () => ({
      access: jest.fn().mockResolvedValue(null),
      unlink: jest.fn().mockResolvedValue(null),
    }));
    jest.spyOn(fileRepository, 'findOne').mockResolvedValue(undefined);

    const accessToken = userService.createToken(
      {
        id: testUser.id,
        email: testUser.email,
        userName: testUser.userName,
        role: 'user',
      },
      'access',
    );

    // when
    const response = await request(app.getHttpServer())
      .delete(`/api/file/${Number.MAX_SAFE_INTEGER}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
