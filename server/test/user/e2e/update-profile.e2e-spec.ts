import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserService } from '../../../src/user/service/user.service';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { UserFixture } from '../../fixture/user.fixture';
import { User } from '../../../src/user/entity/user.entity';
import { UpdateUserDto } from '../../../src/user/dto/request/update-user.dto';

describe('PATCH /api/user/profile E2E Test', () => {
  let app: INestApplication;
  let userService: UserService;
  let userRepository: UserRepository;
  let testUser: User;

  const testUpdateData = {
    complete: {
      userName: '변경된이름',
      profileImage: 'new-profile-uuid',
      introduction: '변경된 소개글입니다.',
    },
    partial: {
      userName: '부분수정이름',
    },
  };

  beforeAll(async () => {
    app = global.testApp;
    userService = app.get(UserService);
    userRepository = app.get(UserRepository);

    testUser = await userRepository.save(
      await UserFixture.createUserCryptFixture({
        userName: '기존이름',
        profileImage: 'old-profile-uuid',
        introduction: '기존 소개글입니다.',
      }),
    );
  });

  it('로그인한 사용자가 프로필 정보를 성공적으로 수정한다.', async () => {
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

    // when
    const response = await request(app.getHttpServer())
      .patch('/api/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testUpdateData.complete);

    // then
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      '사용자 프로필 정보가 성공적으로 수정되었습니다.',
    );

    const updatedUser = await userRepository.findOneBy({ id: testUser.id });
    expect(updatedUser.userName).toBe(testUpdateData.complete.userName);
    expect(updatedUser.profileImage).toBe(testUpdateData.complete.profileImage);
    expect(updatedUser.introduction).toBe(testUpdateData.complete.introduction);
  });

  it('일부 필드만 수정해도 성공적으로 업데이트된다.', async () => {
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

    // when
    const response = await request(app.getHttpServer())
      .patch('/api/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(testUpdateData.partial);

    // then
    expect(response.status).toBe(200);

    const updatedUser = await userRepository.findOneBy({ id: testUser.id });
    expect(updatedUser.userName).toBe(testUpdateData.partial.userName);
    expect(updatedUser.profileImage).toBe(originalUser.profileImage);
    expect(updatedUser.introduction).toBe(originalUser.introduction);
  });

  it('로그인하지 않은 사용자가 프로필 수정을 시도하면 401 에러가 발생한다.', async () => {
    // when - then
    const response = await request(app.getHttpServer())
      .patch('/api/user/profile')
      .send(testUpdateData.complete);

    expect(response.status).toBe(401);
  });
});
