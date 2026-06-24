import 'reflect-metadata';

import axios from 'axios';

import { NOTIFICATION_EVENT } from '@notification/notification-event.constant';
import { DiscordNotifier } from '@notification/discord.notifier';

jest.mock('axios');

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe('DiscordNotifier unit test', () => {
  const mockWebhookUrl = 'http://discord.test/webhook';
  let originalWebhookUrl: string | undefined;
  let mockPost: jest.Mock;

  beforeEach(() => {
    originalWebhookUrl = process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;
    process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL = mockWebhookUrl;

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

  describe('생성자 unit test', () => {
    it('Webhook URL이 없으면 에러를 던진다', () => {
      delete process.env.EMAIL_WORKER_DISCORD_WEBHOOK_URL;

      expect(() => new DiscordNotifier()).toThrow(
        'DISCORD Webhook url이 설정되지 않았습니다.',
      );
    });
  });

  describe('publish unit test', () => {
    it('start 후 EMAIL_DLQ 이벤트를 publish하면 Discord webhook으로 알림을 전송한다', async () => {
      const notifier = new DiscordNotifier();
      notifier.start();

      const payload = {
        error: new Error('SMTP 550'),
        dlqMessage: '[SMTP 500 에러 발생]',
      };
      notifier.publish(NOTIFICATION_EVENT.EMAIL_DLQ, payload);

      await flushAsync();

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url, body] = mockPost.mock.calls[0] as [string, { content: string }];
      expect(url).toBe(mockWebhookUrl);
      expect(body.content).toContain(payload.dlqMessage);
      expect(body.content).toContain('SMTP 550');
    });

    it('start를 호출하지 않으면 publish해도 알림을 전송하지 않는다', async () => {
      const notifier = new DiscordNotifier();

      notifier.publish(NOTIFICATION_EVENT.EMAIL_DLQ, {
        error: new Error('boom'),
        dlqMessage: '[테스트]',
      });

      await flushAsync();

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('start를 여러 번 호출해도 리스너는 한 번만 등록된다', async () => {
      const notifier = new DiscordNotifier();
      notifier.start();
      notifier.start();

      notifier.publish(NOTIFICATION_EVENT.EMAIL_DLQ, {
        error: new Error('boom'),
        dlqMessage: '[테스트]',
      });

      await flushAsync();

      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('webhook 전송이 실패해도 예외를 전파하지 않는다', async () => {
      mockPost.mockRejectedValueOnce(new Error('network down'));
      const notifier = new DiscordNotifier();
      notifier.start();

      expect(() =>
        notifier.publish(NOTIFICATION_EVENT.EMAIL_DLQ, {
          error: new Error('boom'),
          dlqMessage: '[테스트]',
        }),
      ).not.toThrow();

      await flushAsync();

      expect(mockPost).toHaveBeenCalledTimes(1);
    });

    it('Error 인스턴스가 아닌 값으로 실패해도 예외를 전파하지 않는다', async () => {
      mockPost.mockRejectedValueOnce('non-error failure');
      const notifier = new DiscordNotifier();
      notifier.start();

      expect(() =>
        notifier.publish(NOTIFICATION_EVENT.EMAIL_DLQ, {
          error: new Error('boom'),
          dlqMessage: '[테스트]',
        }),
      ).not.toThrow();

      await flushAsync();

      expect(mockPost).toHaveBeenCalledTimes(1);
    });
  });
});
