import { Lifecycle } from '@common/lifecycle/lifecycle.interface';
import { NotificationEventPayloadMap } from '@common/notification/notification-event.constant';

export interface Notifier extends Lifecycle {
  start(): void;
  publish<K extends keyof NotificationEventPayloadMap>(
    eventName: K,
    payload: NotificationEventPayloadMap[K],
  ): void;
}
