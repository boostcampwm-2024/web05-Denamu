import { HttpStatus } from '@nestjs/common';

import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { Admin } from '@admin/entity/admin.entity';
import { AdminRepository } from '@admin/repository/admin.repository';

import { REDIS_KEYS } from '@common/redis/redis.constant';
import { RedisService } from '@common/redis/redis.service';

import { SendMarketingEmailRequestDto } from '@marketingEmail/dto/request/sendMarketingEmail.dto';
import { MarketingEmailRepository } from '@marketingEmail/repository/marketingEmail.repository';

import { UserRepository } from '@user/repository/user.repository';

import { AdminFixture } from '@test/config/common/fixture/admin.fixture';
import { UserFixture } from '@test/config/common/fixture/user.fixture';
import { testApp } from '@test/config/e2e/env/jest.setup';

const URL = '/api/admins/marketing-emails';

describe(`POST ${URL} E2E Test`, () => {
  let agent: TestAgent;
  let redisService: RedisService;
  let adminRepository: AdminRepository;
  let userRepository: UserRepository;
  let marketingEmailRepository: MarketingEmailRepository;

  const sessionKey = 'admin-marketing-email-send-session-key';
  const redisKeyMake = (data: string) => `${REDIS_KEYS.ADMIN_AUTH_KEY}:${data}`;

  let admin: Admin;

  beforeAll(() => {
    agent = supertest(testApp.getHttpServer());
    redisService = testApp.get(RedisService);
    adminRepository = testApp.get(AdminRepository);
    userRepository = testApp.get(UserRepository);
    marketingEmailRepository = testApp.get(MarketingEmailRepository);
  });

  beforeEach(async () => {
    admin = await adminRepository.save(
      await AdminFixture.createAdminCryptFixture(),
    );
    await redisService.set(redisKeyMake(sessionKey), admin.email);

    await userRepository.save(
      await UserFixture.createUserCryptFixture({ marketingEmailAgreed: true }),
    );
    await userRepository.save(
      await UserFixture.createUserCryptFixture({ marketingEmailAgreed: false }),
    );
  });

  it('[401] 관리자 세션 쿠키가 없을 경우 발송을 실패한다.', async () => {
    // given
    const requestDto = new SendMarketingEmailRequestDto({
      subject: '8월 소식',
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent.post(URL).send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

    // DB then
    expect(await marketingEmailRepository.count()).toBe(0);
  });

  it('[201] 제목과 본문을 입력할 경우 수신 동의한 사용자에게만 발송을 성공한다.', async () => {
    // given
    const requestDto = new SendMarketingEmailRequestDto({
      subject: '8월 소식',
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { message, data } = response.body as {
      message: string;
      data: { id: number; recipientCount: number; authorName: string };
    };
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(message).toBe('이메일이 성공적으로 발송되었습니다.');
    expect(data).toMatchObject({
      subject: requestDto.subject,
      recipientCount: 1,
      authorName: admin.name,
    });

    // DB then
    const saved = await marketingEmailRepository.findOne({
      where: { id: data.id },
      relations: ['author'],
    });
    expect(saved.subject).toBe(requestDto.subject);
    expect(saved.content).toBe(requestDto.content);
    expect(saved.recipientCount).toBe(1);
    expect(saved.author.id).toBe(admin.id);
  });

  it('[201] 수신 동의한 사용자가 없을 경우 수신자 수 0으로 발송을 성공한다.', async () => {
    // given
    await userRepository.delete({ marketingEmailAgreed: true });
    const requestDto = new SendMarketingEmailRequestDto({
      subject: '8월 소식',
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as { data: { recipientCount: number } };
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(data.recipientCount).toBe(0);

    // DB then
    expect(await marketingEmailRepository.count()).toBe(1);
  });

  it('[201] 본문에 허용되지 않은 태그가 포함될 경우 제거된 상태로 발송을 성공한다.', async () => {
    // given
    const requestDto = new SendMarketingEmailRequestDto({
      subject: '8월 소식',
      content: '<p>본문</p><script>alert(1)</script>',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    const { data } = response.body as { data: { id: number } };
    expect(response.status).toBe(HttpStatus.CREATED);

    // DB then
    const saved = await marketingEmailRepository.findOneBy({ id: data.id });
    expect(saved.content).toBe('<p>본문</p>');
  });

  it('[400] 제목이 255자를 초과할 경우 발송을 실패한다.', async () => {
    // given
    const requestDto = new SendMarketingEmailRequestDto({
      subject: 'a'.repeat(256),
      content: '<p>본문</p>',
    });

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await marketingEmailRepository.count()).toBe(0);
  });

  it('[400] 제목이 없을 경우 발송을 실패한다.', async () => {
    // given
    const requestDto = { content: '<p>본문</p>' };

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await marketingEmailRepository.count()).toBe(0);
  });

  it('[400] 본문이 없을 경우 발송을 실패한다.', async () => {
    // given
    const requestDto = { subject: '8월 소식' };

    // Http when
    const response = await agent
      .post(URL)
      .set('Cookie', `sessionId=${sessionKey}`)
      .send(requestDto);

    // Http then
    expect(response.status).toBe(HttpStatus.BAD_REQUEST);

    // DB then
    expect(await marketingEmailRepository.count()).toBe(0);
  });
});
