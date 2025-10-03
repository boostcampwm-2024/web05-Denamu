import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UploadFileQueryRequestDto } from '../../../src/file/dto/request/uploadFile.dto';
import * as fs from 'fs';
import { FileUploadType } from '../../../src/common/disk/fileValidator';
import { UserService } from '../../../src/user/service/user.service';
import { User } from '../../../src/user/entity/user.entity';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import * as path from 'path';

describe('POST /api/file', () => {
  let app: INestApplication;
  let testUser: User;
  let userService: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    userRepository = app.get(UserRepository);
    userService = app.get(UserService);
    testUser = await userRepository.save(
      await UserFixture.createUserCryptFixture(),
    );
  });

  it('[401] 인증되지 않은 사용자가 요청할 경우 파일 업로드를 실패한다.', async () => {
    // given
    const dto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    // when
    const response = await request(app.getHttpServer())
      .post('/api/file')
      .query(dto);

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('[400] 파일 형식을 나타내는 쿼리가 없을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const filePath = path.resolve(__dirname, '../../fixture/test.png');
    const fileBuffer = fs.readFileSync(filePath);

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
      .post('/api/file')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', fileBuffer, 'test.png');

    // then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[400] 파일이 포함되어 있지 않을 경우 파일 업로드를 실패한다.', async () => {
    // given
    const dto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });
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
      .post('/api/file')
      .query(dto)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    // then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('[201] 이미지를 포함하고 쿼리를 포함하여 보낼 경우 올바르게 통과할 수 있다.', async () => {
    // given
    const dto = new UploadFileQueryRequestDto({
      uploadType: FileUploadType.PROFILE_IMAGE,
    });

    const filePath = path.resolve(__dirname, '../../fixture/test.png');
    const accessToken = userService.createToken(
      {
        id: testUser.id,
        email: testUser.email,
        userName: testUser.userName,
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
    const response = await request(app.getHttpServer())
      .post('/api/file')
      .query(dto)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath);

    // then
    expect(response.status).toBe(HttpStatus.CREATED);
  });
});
