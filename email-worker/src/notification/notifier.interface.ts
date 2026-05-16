import { NotificationEventPayloadMap } from '@src/notification/notification-event.constant';

export interface Notifier {
  initialize(): void;
  publish<K extends keyof NotificationEventPayloadMap>(
    eventName: K,
    payload: NotificationEventPayloadMap[K],
  ): void;
}
