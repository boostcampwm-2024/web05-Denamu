export const NOTIFICATION_EVENT = {
  EMAIL_DLQ: 'email.dlq',
} as const;

export type NotificationEvent =
  (typeof NOTIFICATION_EVENT)[keyof typeof NOTIFICATION_EVENT];

export interface EmailDlqPayload {
  error: Error;
  dlqMessage: string;
}

export type NotificationEventPayloadMap = {
  [NOTIFICATION_EVENT.EMAIL_DLQ]: EmailDlqPayload;
};
