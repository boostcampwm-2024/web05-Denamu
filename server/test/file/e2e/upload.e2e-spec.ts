import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UploadFileQueryRequestDto } from '../../../src/file/dto/request/uploadFile.dto';
import { FileUploadType } from '../../../src/common/disk/fileValidator';
import { UserService } from '../../../src/user/service/user.service';
import { User } from '../../../src/user/entity/user.entity';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import * as path from 'path';
import TestAgent from 'supertest/lib/agent';
import { FileRepository } from '../../../src/file/repository/file.repository';

const URL = '/api/file';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let userService: UserService;
  let userRepository: UserRepository;
  let fileRepository: FileRepository;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    userRepository = app.get(UserRepository);
    userService = app.get(UserService);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
    fileRepository = app.get(FileRepository);
  });

  it('[401] 인증되지 않은 사용자가 요청할 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // when
    const response = await agent.post(URL).query(requestDto);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[400] 파일이 포함되어 있지 않을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });
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
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
  });

  it('[201] 파일을 포함할 경우 파일 업로드를 성공한다.', async () => {
    // given
    const requestDto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    const filePath = path.resolve(__dirname, '../../fixture/test.png');
    const accessToken = userService.createToken(
      {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: 'user',
      },
      'access',
    );

    jest.mock('../../../src/common/disk/fileUtils', () => ({
      ...jest.requireActual('../../../src/common/disk/fileUtils'),
      createDirectoryIfNotExists: jest.fn().mockReturnValue('/test/20251002/'),
      getFileName: jest.fn().mockReturnValue('test-uuidv4-code.png'),
    }));

    // when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath);

    // then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data).toStrictEqual({
      id: expect.any(Number),
      originalName: 'test.png',
      mimetype: 'image/png',
      size: expect.any(Number),
      url: expect.any(String),
      userId: user.id,
      createdAt: expect.any(String),
    });

    // cleanup
    await fileRepository.delete({ user });
  });
});
