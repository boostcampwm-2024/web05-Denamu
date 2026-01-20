import 'reflect-metadata';
import { EmailConsumer } from '@email/email.consumer';
import { RabbitMQService } from '@rabbitmq/rabbitmq.service';
import { EmailPayloadConstant } from '@src/types/types';
import { RMQ_EXCHANGES, RMQ_ROUTING_KEYS } from '@rabbitmq/rabbitmq.constant';
import { setupTestContainer } from '@test/config/e2e/common/testContext.setup';
import { RabbitMQManager } from '@rabbitmq/rabbitmq.manager';

describe(`Email Normal Scenario E2E Test`, () => {
  let emailConsumer: EmailConsumer;
  let rabbitmqService: RabbitMQService;
  let rabbitmqManager: RabbitMQManager;
  const testContext = setupTestContainer();

  beforeAll(async () => {
    emailConsumer = testContext.emailConsumer;
    rabbitmqService = testContext.rabbitmqService;
    rabbitmqManager = testContext.rabbitmqManager;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    console.log('Closing Email Consumer...');
    if (global.testContext) {
      await emailConsumer.close();
      await rabbitmqManager.disconnect();
      delete global.testContext;
    }
    console.log('Email Consumer closed.');
  });

  it('인증 메시지가 있다면 인증 이메일을 보낸다.', async () => {
    //given
    const payload = {
      type: EmailPayloadConstant.USER_CERTIFICATION,
      data: {
        email: 'test@test.com',
        userName: 'tester',
        uuid: 'test-uuid',
      },
    };
    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );

    //when
    await emailConsumer.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //then
    const mailpitContainer = global.__MAILPIT_CONTAINER__;
    const webPort = mailpitContainer.getMappedPort(8025);
    const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;

    const response = await fetch(`${baseUrl}/api/v1/messages`);
    const data = await response.json();

    await fetch(`${baseUrl}/api/v1/messages`, {
      method: 'DELETE',
    });

    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].To[0].Address).toBe('test@test.com');
    expect(data.messages[0].Subject).toContain('회원가입');
  });

  it('RSS 삭제 메시지가 있다면 인증 이메일을 보낸다.', async () => {
    //given
    const payload = {
      type: EmailPayloadConstant.RSS_REMOVAL,
      data: {
        userName: 'tester',
        email: 'test@test.com',
        rssUrl: 'test@blog.com',
        certificateCode: 'test-uuid',
      },
    };

    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );

    //when
    await emailConsumer.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //then
    const mailpitContainer = global.__MAILPIT_CONTAINER__;
    const webPort = mailpitContainer.getMappedPort(8025);
    const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;

    const response = await fetch(`${baseUrl}/api/v1/messages`);
    const data = await response.json();

    await fetch(`${baseUrl}/api/v1/messages`, {
      method: 'DELETE',
    });

    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].To[0].Address).toBe('test@test.com');
    expect(data.messages[0].Subject).toContain('RSS 삭제');
  });

  it('RSS 등록 승인 메시지가 있다면 승인 이메일을 보낸다.', async () => {
    //given
    const payload = {
      type: EmailPayloadConstant.RSS_REGISTRATION,
      data: {
        rss: {
          name: 'test blog',
          userName: 'tester',
          email: 'test@test.com',
          rssUrl: 'test@blog.com',
        },
        approveFlag: true,
      },
    };

    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );

    //when
    await emailConsumer.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //then
    const mailpitContainer = global.__MAILPIT_CONTAINER__;
    const webPort = mailpitContainer.getMappedPort(8025);
    const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;

    const response = await fetch(`${baseUrl}/api/v1/messages`);
    const data = await response.json();

    await fetch(`${baseUrl}/api/v1/messages`, {
      method: 'DELETE',
    });

    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].To[0].Address).toBe('test@test.com');
    expect(data.messages[0].Subject).toContain('RSS 등록이 승인');
  });

  it('RSS 등록 거부 메시지가 있다면 거부 이메일을 보낸다.', async () => {
    //given
    const payload = {
      type: EmailPayloadConstant.RSS_REGISTRATION,
      data: {
        rss: {
          name: 'test blog',
          userName: 'tester',
          email: 'test@test.com',
          rssUrl: 'test@blog.com',
        },
        approveFlag: false,
        description: `등록 실패 사유`,
      },
    };

    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );

    //when
    await emailConsumer.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //then
    const mailpitContainer = global.__MAILPIT_CONTAINER__;
    const webPort = mailpitContainer.getMappedPort(8025);
    const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;

    const response = await fetch(`${baseUrl}/api/v1/messages`);
    const data = await response.json();

    await fetch(`${baseUrl}/api/v1/messages`, {
      method: 'DELETE',
    });

    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].To[0].Address).toBe('test@test.com');
    expect(data.messages[0].Subject).toContain('RSS 등록이 거부');
  });

  it('비밀번호 변경 메시지가 있다면 인증 이메일을 보낸다.', async () => {
    //given
    const payload = {
      type: EmailPayloadConstant.PASSWORD_RESET,
      data: {
        email: 'test@test.com',
        userName: 'tester',
        uuid: 'test-uuid',
      },
    };
    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );

    //when
    await emailConsumer.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //then
    const mailpitContainer = global.__MAILPIT_CONTAINER__;
    const webPort = mailpitContainer.getMappedPort(8025);
    const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;

    const response = await fetch(`${baseUrl}/api/v1/messages`);
    const data = await response.json();

    await fetch(`${baseUrl}/api/v1/messages`, {
      method: 'DELETE',
    });

    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].To[0].Address).toBe('test@test.com');
    expect(data.messages[0].Subject).toContain('비밀번호 재설정');
  });

  it('계정 삭제 메시지가 있다면 인증 이메일을 보낸다.', async () => {
    //given
    const payload = {
      type: EmailPayloadConstant.ACCOUNT_DELETION,
      data: {
        email: 'test@test.com',
        userName: 'tester',
        uuid: 'test-uuid',
      },
    };
    await rabbitmqService.sendMessage(
      RMQ_EXCHANGES.EMAIL,
      RMQ_ROUTING_KEYS.EMAIL_SEND,
      JSON.stringify(payload),
    );

    //when
    await emailConsumer.start();
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //then
    const mailpitContainer = global.__MAILPIT_CONTAINER__;
    const webPort = mailpitContainer.getMappedPort(8025);
    const baseUrl = `http://${mailpitContainer.getHost()}:${webPort}`;

    const response = await fetch(`${baseUrl}/api/v1/messages`);
    const data = await response.json();

    await fetch(`${baseUrl}/api/v1/messages`, {
      method: 'DELETE',
    });

    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].To[0].Address).toBe('test@test.com');
    expect(data.messages[0].Subject).toContain('회원탈퇴');
  });
});
