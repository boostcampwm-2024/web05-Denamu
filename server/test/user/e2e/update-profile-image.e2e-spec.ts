import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { FileService } from '@file/service/file.service';

import { PROFILE_IMAGE_DAILY_LIMIT } from '@user/constant/user.constants';
import { UpdateProfileImageRequestDto } from '@user/dto/request/updateProfileImage.dto';
import { User } from '@user/entity/user.entity';
import { UserRepository } from '@user/repository/user.repository';

import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { createAccessToken } from '@test/config/e2e/env/jest.setup';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/users/profile-image';

describe(`PATCH ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let userRepository: UserRepository;
  let fileService: FileService;
  let deleteByPathSpy: jest.SpyInstance;
  let user: User;
  let accessToken: string;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    fileService = testApp.get(FileService);
    userRepository = testApp.get(UserRepository);
  });

  beforeEach(async () => {
    deleteByPathSpy = jest
      .spyOn(fileService, 'deleteByPath')
      .mockResolvedValue(undefined);
    user = await userRepository.save(
      await UserFixture.createUserCryptFixture({
        userName: '기존이름',
        profileImage: 'https://url/objects/PROFILE_IMAGE/20000902/uuid_old.png',
      }),
    );
    accessToken = createAccessToken(user);
  });

  it('[401] 로그인하지 않은 유저가 프로필 이미지 변경 요청을 할 경우 실패한다.', async () => {
    // given
    const requestDto: UpdateProfileImageRequestDto = {
      profileImage: 'https://url/objects/PROFILE_IMAGE/20000902/uuid.png',
    };

    // Http when
    const response = await agent.patch(URL).send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(data).toBeUndefined();

    // DB when
    const savedUser = await userRepository.findOneBy({ id: user.id });

    // DB then
    expect(savedUser.profileImage).toBe(user.profileImage);
  });

  it('[200] 프로필 이미지 변경 요청을 하면 기존 파일을 삭제하고 변경에 성공한다.', async () => {
    // given
    const requestDto: UpdateProfileImageRequestDto = {
      profileImage: 'https://url/objects/PROFILE_IMAGE/20000902/uuid_new.png',
    };

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.OK);
    expect(data).toBeUndefined();
    expect(deleteByPathSpy).toHaveBeenCalledWith(user.profileImage);

    // DB when
    const savedUser = await userRepository.findOneBy({ id: user.id });

    // DB then
    expect(savedUser.profileImage).toBe(requestDto.profileImage);
    expect(savedUser.profileImageChangeCount).toBe(1);
  });

  it('[400] 하루 최대 변경 횟수를 초과하면 변경에 실패한다.', async () => {
    // given
    await userRepository.update(
      { id: user.id },
      { profileImageChangeCount: PROFILE_IMAGE_DAILY_LIMIT },
    );
    const requestDto: UpdateProfileImageRequestDto = {
      profileImage: 'https://url/objects/PROFILE_IMAGE/20000902/uuid_new.png',
    };

    // Http when
    const response = await agent
      .patch(URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(requestDto);

    // Http then
    const { data } = response.body;
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    expect(data).toBeUndefined();
    expect(deleteByPathSpy).not.toHaveBeenCalled();

    // DB when
    const savedUser = await userRepository.findOneBy({ id: user.id });

    // DB then
    expect(savedUser.profileImage).toBe(user.profileImage);
  });
});
