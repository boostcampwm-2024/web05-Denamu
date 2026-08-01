import { injectable } from 'tsyringe';

import logger from '@common/logger/logger';

import { NotificationEventPayloadMap } from '@notification/notification-event.constant';
import { Notifier } from '@notification/notifier.interface';

@injectable()
export class NotifierRegistry implements Notifier {
  private readonly notifiers = new Map<string, Notifier>();

  register(name: string, notifier: Notifier): void {
    this.notifiers.set(name, notifier);
  }

  start(): void {
    this.notifiers.forEach((notifier) => notifier.start());
    logger.info('Notifier 초기화 완료');
  }

  publish<K extends keyof NotificationEventPayloadMap>(
    eventName: K,
    payload: NotificationEventPayloadMap[K],
  ): void {
    this.notifiers.forEach((notifier) => notifier.publish(eventName, payload));
  }
}
