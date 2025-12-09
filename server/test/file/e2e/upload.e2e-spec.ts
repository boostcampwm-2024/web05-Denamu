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

jest.mock('../../../src/common/disk/fileUtils', () => ({
  ...jest.requireActual('../../../src/common/disk/fileUtils'),
  createDirectoryIfNotExists: jest.fn().mockReturnValue('/test/20251002/'),
  getFileName: jest.fn().mockReturnValue('test-uuidv4-code.png'),
}));

const URL = '/api/file';

describe(`POST ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let user: User;
  let fileRepository: FileRepository;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    fileRepository = app.get(FileRepository);
    const userRepository = app.get(UserRepository);
    const userService = app.get(UserService);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );

    createAccessToken = (notFoundId?: number) =>
      userService.createToken(
        {
          id: notFoundId ?? user.id,
          email: user.email,
          userName: user.userName,
          role: 'user',
        },
        'access',
      );
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
    const accessToken = createAccessToken();

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`);

    // Http then
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
    const accessToken = createAccessToken();

    // Http when
    const response = await agent
      .post(URL)
      .query(requestDto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath);

    // Http then
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
