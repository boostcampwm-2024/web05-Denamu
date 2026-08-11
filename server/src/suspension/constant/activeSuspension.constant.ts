export const activeSuspensionExclusion = (userIdColumn: string) =>
  `${userIdColumn} NOT IN (SELECT us.user_id FROM user_suspension us WHERE us.suspended_until IS NULL OR us.suspended_until > :now)`;
