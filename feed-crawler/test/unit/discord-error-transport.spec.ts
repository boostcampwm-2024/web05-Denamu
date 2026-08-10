import 'reflect-metadata';

import axios from 'axios';

import { DiscordErrorTransport } from '@common/logger/discord-error-transport';

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe('DiscordErrorTransport', () => {
  const WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
  let mockAxiosPost: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockAxiosPost = jest.spyOn(axios, 'post').mockResolvedValue({});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL;
  });

  it('webhook URL이 없으면 axios.post를 호출하지 않아야 한다', async () => {
    // Given
    delete process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL;
    const transport = new DiscordErrorTransport({ level: 'error' });
    const callback = jest.fn();

    // When
    transport.log({ message: '에러 발생' }, callback);
    await flushAsync();

    // Then
    expect(mockAxiosPost).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('webhook URL이 있으면 axios.post로 알림을 전송해야 한다', async () => {
    // Given
    process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL = WEBHOOK_URL;
    const transport = new DiscordErrorTransport({ level: 'error' });
    const callback = jest.fn();

    // When
    transport.log({ message: '에러 발생' }, callback);
    await flushAsync();

    // Then
    expect(mockAxiosPost).toHaveBeenCalledWith(
      WEBHOOK_URL,
      expect.objectContaining({
        content: expect.stringContaining('에러 발생'),
      }),
    );
    expect(callback).toHaveBeenCalled();
  });

  it('전송이 실패해도 throw하지 않고 console.error로만 남겨야 한다', async () => {
    // Given
    process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL = WEBHOOK_URL;
    mockAxiosPost.mockRejectedValue(new Error('network down'));
    const transport = new DiscordErrorTransport({ level: 'error' });
    const callback = jest.fn();

    // When
    expect(() => transport.log({ message: '에러 발생' }, callback)).not.toThrow();
    await flushAsync();

    // Then
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Discord 알림 전송 실패:',
      expect.any(Error),
    );
  });
});
