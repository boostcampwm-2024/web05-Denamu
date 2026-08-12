import axios from 'axios';

import { DiscordErrorTransport } from '@common/logger/discord-error-transport';

jest.mock('axios');

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe('DiscordErrorTransport unit test', () => {
  const mockWebhookUrl = 'http://discord.test/webhook';
  let originalWebhookUrl: string | undefined;
  let mockPost: jest.Mock;

  beforeEach(() => {
    originalWebhookUrl = process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;

    mockPost = jest.fn().mockResolvedValue({ status: 204 });
    (axios.post as jest.Mock) = mockPost;
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (originalWebhookUrl !== undefined) {
      process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL = originalWebhookUrl;
    } else {
      delete process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;
    }
  });

  it('webhook이 설정되지 않으면 axios.post를 호출하지 않고 callback을 호출한다', async () => {
    delete process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;
    const transport = new DiscordErrorTransport();
    const callback = jest.fn();

    transport.log({ message: 'boom' }, callback);
    await flushAsync();

    expect(mockPost).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('webhook이 설정되어 있으면 error 로그 메시지를 Discord webhook으로 전송한다', async () => {
    process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL = mockWebhookUrl;
    const transport = new DiscordErrorTransport();
    const callback = jest.fn();

    transport.log({ message: 'SMTP 550' }, callback);
    await flushAsync();

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [url, body] = mockPost.mock.calls[0] as [string, { content: string }];
    expect(url).toBe(mockWebhookUrl);
    expect(body.content).toContain('SMTP 550');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('webhook 전송이 실패해도 예외를 전파하지 않는다', async () => {
    process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL = mockWebhookUrl;
    mockPost.mockRejectedValueOnce(new Error('network down'));
    const transport = new DiscordErrorTransport();
    const callback = jest.fn();

    expect(() => transport.log({ message: 'boom' }, callback)).not.toThrow();
    await flushAsync();

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
