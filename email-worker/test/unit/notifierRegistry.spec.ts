import 'reflect-metadata';

import { NOTIFICATION_EVENT } from '@notification/notification-event.constant';
import { NotifierRegistry } from '@notification/notifier-registry';
import { Notifier } from '@notification/notifier.interface';

describe('NotifierRegistry unit test', () => {
  let registry: NotifierRegistry;
  let notifierA: Notifier;
  let notifierB: Notifier;
  let startA: jest.Mock;
  let startB: jest.Mock;
  let publishA: jest.Mock;
  let publishB: jest.Mock;

  beforeEach(() => {
    registry = new NotifierRegistry();
    startA = jest.fn();
    startB = jest.fn();
    publishA = jest.fn();
    publishB = jest.fn();
    notifierA = { start: startA, publish: publishA };
    notifierB = { start: startB, publish: publishB };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('start unit test', () => {
    it('등록된 모든 notifier의 start를 호출한다', () => {
      registry.register('A', notifierA);
      registry.register('B', notifierB);

      registry.start();

      expect(startA).toHaveBeenCalledTimes(1);
      expect(startB).toHaveBeenCalledTimes(1);
    });

    it('등록된 notifier가 없어도 에러 없이 동작한다', () => {
      expect(() => registry.start()).not.toThrow();
    });
  });

  describe('publish unit test', () => {
    it('등록된 모든 notifier에 이벤트를 전달한다', () => {
      registry.register('A', notifierA);
      registry.register('B', notifierB);
      const payload = {
        error: new Error('boom'),
        dlqMessage: '[테스트]',
      };

      registry.publish(NOTIFICATION_EVENT.EMAIL_DLQ, payload);

      expect(publishA).toHaveBeenCalledWith(
        NOTIFICATION_EVENT.EMAIL_DLQ,
        payload,
      );
      expect(publishB).toHaveBeenCalledWith(
        NOTIFICATION_EVENT.EMAIL_DLQ,
        payload,
      );
    });
  });

  describe('register unit test', () => {
    it('같은 이름으로 재등록하면 마지막 notifier로 덮어쓴다', () => {
      registry.register('A', notifierA);
      registry.register('A', notifierB);

      registry.start();

      expect(startA).not.toHaveBeenCalled();
      expect(startB).toHaveBeenCalledTimes(1);
    });
  });
});
