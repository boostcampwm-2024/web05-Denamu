import 'reflect-metadata';

import axios from 'axios';

import logger from '@common/logger/logger';
import { DiscordNotifier } from '@common/notification/discord.notifier';
import { NOTIFICATION_EVENT } from '@common/notification/notification-event.constant';

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe('DiscordNotifier', () => {
  const WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
  let mockAxiosPost: jest.SpyInstance;

  beforeEach(() => {
    process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL = WEBHOOK_URL;
    mockAxiosPost = jest.spyOn(axios, 'post').mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL;
  });

  describe('constructor', () => {
    it('webhook URL이 설정되지 않으면 에러를 던져야 한다', () => {
      // Given
      delete process.env.FEED_CRAWLER_DISCORD_WEBHOOK_URL;

      // When & Then
      expect(() => new DiscordNotifier()).toThrow(
        'DISCORD Webhook url이 설정되지 않았습니다.',
      );
    });

    it('webhook URL이 설정되면 정상적으로 생성되어야 한다', () => {
      expect(() => new DiscordNotifier()).not.toThrow();
    });
  });

  describe('publish', () => {
    it('start() 이전에는 이벤트를 발행해도 아무 일도 일어나지 않아야 한다', async () => {
      // Given - start() 호출 전에는 리스너가 등록되지 않음
      const notifier = new DiscordNotifier();

      // When
      notifier.publish(NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED, {
        error: new Error('boom'),
        blogUrl: 'https://blog.com/rss',
        errorSource: '[Scheduled FeedCrawling]',
      });
      await flushAsync();

      // Then
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('scheduled 크롤링 이벤트를 Discord webhook으로 전송해야 한다', async () => {
      // Given
      const notifier = new DiscordNotifier();
      notifier.start();

      // When
      notifier.publish(NOTIFICATION_EVENT.FEED_CRAWLING_SCHEDULED, {
        error: new Error('scheduled 에러'),
        blogUrl: 'https://blog.com/rss',
        errorSource: '[Scheduled FeedCrawling]',
      });
      await flushAsync();

      // Then
      expect(mockAxiosPost).toHaveBeenCalledWith(
        WEBHOOK_URL,
        expect.objectContaining({
          content: expect.stringContaining('scheduled 에러'),
        }),
      );
    });

    it('full 크롤링 이벤트를 Discord webhook으로 전송해야 한다', async () => {
      // Given
      const notifier = new DiscordNotifier();
      notifier.start();

      // When
      notifier.publish(NOTIFICATION_EVENT.FEED_CRAWLING_FULL, {
        error: new Error('full 에러'),
        blogUrl: 'https://blog.com/rss',
        errorSource: '[Full FeedCrawling]',
      });
      await flushAsync();

      // Then
      expect(mockAxiosPost).toHaveBeenCalledWith(
        WEBHOOK_URL,
        expect.objectContaining({
          content: expect.stringContaining('full feed crawling'),
        }),
      );
    });

    it('AI 요약 이벤트를 Discord webhook으로 전송해야 한다', async () => {
      // Given
      const notifier = new DiscordNotifier();
      notifier.start();

      // When
      notifier.publish(NOTIFICATION_EVENT.AI_SUMMARY, {
        error: new Error('ai 에러'),
        feedId: 42,
        errorSource: '[AI Summary]',
      });
      await flushAsync();

      // Then
      expect(mockAxiosPost).toHaveBeenCalledWith(
        WEBHOOK_URL,
        expect.objectContaining({
          content: expect.stringContaining('42번 Feed AI 요약'),
        }),
      );
    });

    it('webhook 전송이 실패해도 예외를 던지지 않고 에러를 로깅해야 한다', async () => {
      // Given
      const errorSpy = jest.spyOn(logger, 'error').mockImplementation();
      mockAxiosPost.mockRejectedValue(new Error('network down'));
      const notifier = new DiscordNotifier();
      notifier.start();

      // When
      notifier.publish(NOTIFICATION_EVENT.AI_SUMMARY, {
        error: new Error('ai 에러'),
        feedId: 1,
        errorSource: '[AI Summary]',
      });
      await flushAsync();

      // Then
      expect(errorSpy).toHaveBeenCalledWith(
        'Discord 알림 전송 실패:',
        expect.any(Error),
      );
    });
  });

  describe('start', () => {
    it('여러 번 호출해도 리스너가 중복 등록되지 않아야 한다 (멱등성)', async () => {
      // Given
      const notifier = new DiscordNotifier();
      notifier.start();
      notifier.start();

      // When
      notifier.publish(NOTIFICATION_EVENT.AI_SUMMARY, {
        error: new Error('ai 에러'),
        feedId: 1,
        errorSource: '[AI Summary]',
      });
      await flushAsync();

      // Then - 중복 등록되었다면 2번 호출됨
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });
  });
});
