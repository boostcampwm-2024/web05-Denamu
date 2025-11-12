import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { FileService } from '../../../src/file/service/file.service';
import { UpdateUserRequestDto } from '../../../src/user/dto/request/updateUser.dto';

describe('PATCH /api/user/profile E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepository: UserRepository;
  let fileService: FileService;
  let testUser: User;

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);
    userRepository = app.get(UserRepository);
    fileService = app.get(FileService);

    testUser = await userRepository.save(
      await UserFixture.createUserCryptFixture({
        userName: '기존이름',
        profileImage:
          'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid_old.png',
        introduction: '기존 소개글입니다.',
      }),
    );
  });

  beforeEach(() => {
    jest.spyOn(fileService, 'deleteByPath').mockResolvedValue(undefined);
  });

  it('[200] 로그인한 사용자가 프로필 정보를 성공적으로 수정한다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: testUser.id,
        email: testUser.email,
        userName: testUser.userName,
        role: 'user',
      },
      'access',
    );
    const requestDto = new UpdateUserRequestDto({
      userName: '변경된이름',
      profileImage:
        'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid.png',
      introduction: '변경된 소개글입니다.',
    });

    // when
    const response = await request(app.getHttpServer())
      .patch('/api/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.message).toBe(
      '사용자 프로필 정보가 성공적으로 수정되었습니다.',
    );

    const updatedUser = await userRepository.findOneBy({ id: testUser.id });
    expect(updatedUser.userName).toBe(requestDto.userName);
    expect(updatedUser.profileImage).toBe(requestDto.profileImage);
    expect(updatedUser.introduction).toBe(requestDto.introduction);
  });

  it('[200] 일부 필드만 수정해도 성공적으로 업데이트된다.', async () => {
    // given
    const accessToken = userService.createToken(
      {
        id: testUser.id,
        email: testUser.email,
        userName: testUser.userName,
        role: 'user',
      },
      'access',
    );
    const originalUser = await userRepository.findOneBy({ id: testUser.id });
    const requestDto = new UpdateUserRequestDto({
      userName: '부분수정이름',
    });

    // when
    const response = await request(app.getHttpServer())
      .patch('/api/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);

    const updatedUser = await userRepository.findOneBy({ id: testUser.id });
    expect(updatedUser.userName).toBe(requestDto.userName);
    expect(updatedUser.profileImage).toBe(originalUser.profileImage);
    expect(updatedUser.introduction).toBe(originalUser.introduction);
  });

  it('[401] 로그인하지 않은 사용자가 프로필 수정을 시도하면 401 에러가 발생한다.', async () => {
    // given
    const requestDto = new UpdateUserRequestDto({
      userName: '변경된이름',
      profileImage:
        'https://denamu.site/objects/PROFILE_IMAGE/20000902/uuid.png',
      introduction: '변경된 소개글입니다.',
    });

    // when
    const response = await request(app.getHttpServer())
      .patch('/api/user/profile')
      .send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
