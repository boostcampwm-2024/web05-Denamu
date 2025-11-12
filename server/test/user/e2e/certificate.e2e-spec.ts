import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRepository } from '../../../src/user/repository/user.repository';
import { RedisService } from '../../../src/common/redis/redis.service';
import { UserFixture } from '../../fixture/user.fixture';
import { REDIS_KEYS } from '../../../src/common/redis/redis.constant';
import { CertificateUserRequestDto } from '../../../src/user/dto/request/certificateUser.dto';

describe('POST /api/user/certificate E2E Test', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = global.testApp;
    redisService = app.get(RedisService);
    userRepository = app.get(UserRepository);
  });

  it('[200] 이메일 인증 요청에 성공하여 DB에 사용자 데이터가 삽입된다.', async () => {
    // given
    const uuid = 'test-certificate-uuid';
    const userEntity = UserFixture.createUserFixture();
    const redisKey = `${REDIS_KEYS.USER_AUTH_KEY}:${uuid}`;
    const requestDto = new CertificateUserRequestDto({ uuid });
    await redisService.set(redisKey, JSON.stringify(userEntity));

    // when
    const agent = request.agent(app.getHttpServer());
    const response = await agent.post('/api/user/certificate').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.OK);
    const savedUser = await userRepository.findOne({
      where: { email: userEntity.email },
    });
    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe(userEntity.email);
  });

  it('[404] 존재하지 않거나 만료된 uuid로 인증 요청 시 NotFoundException 에러를 발생시킨다.', async () => {
    // given
    const requestDto = new CertificateUserRequestDto({
      uuid: 'non-existent-or-expired-uuid',
    });

    // when
    const agent = request.agent(app.getHttpServer());
    const response = await agent.post('/api/user/certificate').send(requestDto);

    // then
    expect(response.status).toBe(HttpStatus.NOT_FOUND);
  });
});
