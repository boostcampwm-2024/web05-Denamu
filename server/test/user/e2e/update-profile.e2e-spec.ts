import { HttpStatus, INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { FileService } from '../../../src/file/service/file.service';
import { UpdateUserRequestDto } from '../../../src/user/dto/request/updateUser.dto';
import TestAgent from 'supertest/lib/agent';
import { User } from '../../../src/user/entity/user.entity';

const URL = '/api/user/profile';

describe(`PATCH ${URL} E2E Test`, () => {
  let app: INestApplication;
  let agent: TestAgent;
  let fileService: FileService;
  let userRepository: UserRepository;
  let user: User;
  let createAccessToken: (arg0?: number) => string;

  beforeAll(async () => {
    app = global.testApp;
    agent = supertest(app.getHttpServer());
    fileService = app.get(FileService);
    userRepository = app.get(UserRepository);
    const userService = app.get(UserService);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture({
        userName: '기존이름',
        profileImage:
          'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid_old.png',
        introduction: '기존 소개글입니다.',
      }),
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

  beforeEach(() => {
    jest.spyOn(fileService, 'deleteByPath').mockResolvedValue(undefined);
  });

  it('[401] 로그인하지 않은 유저가 회원 정보 수정 요청을 할 경우 회원 정보 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateUserRequestDto({
      userName: '변경된이름',
      profileImage:
        'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid.png',
      introduction: '변경된 소개글입니다.',
    });

    // Http when
    const response = await agent.patch(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();
  });

  it('[404] 회원 데이터가 서비스에 없을 경우 회원 정보 수정을 실패한다.', async () => {
    // given
    const requestDto = new UpdateUserRequestDto({
      userName: '변경된이름',
      profileImage:
        'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid.png',
      introduction: '변경된 소개글입니다.',
    });
    const accessToken = createAccessToken(Number.MAX_SAFE_INTEGER);

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data).toBeUndefined();
  });

  it('[200] 사용자가 모든 필드 수정 요청을 할 경우 회원 정보 수정을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken();
    const requestDto = new UpdateUserRequestDto({
      userName: '변경된이름',
      profileImage:
        'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid.png',
      introduction: '변경된 소개글입니다.',
    });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedUser = await userRepository.findOneBy({ id: user.id });

    // DB, Redis then
    expect(savedUser.userName).toBe(requestDto.userName);
    expect(savedUser.profileImage).toBe(requestDto.profileImage);
    expect(savedUser.introduction).toBe(requestDto.introduction);
  });

  it('[200] 사용자가 일부 필드만 수정 요청을 할 경우 회원 정보 수정을 성공한다.', async () => {
    // given
    const accessToken = createAccessToken();
    const requestDto = new UpdateUserRequestDto({
      userName: '부분수정이름',
    });

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();

    // DB, Redis when
    const savedUser = await userRepository.findOneBy({ id: user.id });

    // DB, Redis then
    expect(savedUser.userName).toBe(requestDto.userName);
    expect(user.profileImage).toBe(user.profileImage);
    expect(user.introduction).toBe(user.introduction);
  });
});
