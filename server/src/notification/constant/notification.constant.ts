export const NOTIFICATION_RETENTION_DAYS = 30;

export function getNotificationCutoffDate(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - NOTIFICATION_RETENTION_DAYS);
  return cutoff;
}
