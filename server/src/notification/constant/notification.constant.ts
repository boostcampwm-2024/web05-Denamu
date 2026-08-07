export const NOTIFICATION_RETENTION_DAYS = 30;
export const NOTIFICATION_EMAIL_DIGEST_STALE_DAYS = 7;

export function getNotificationCutoffDate(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - NOTIFICATION_RETENTION_DAYS);
  return cutoff;
}

export function getDigestStaleCutoffDate(now: Date = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - NOTIFICATION_EMAIL_DIGEST_STALE_DAYS);
  return cutoff;
}
