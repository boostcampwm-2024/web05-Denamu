const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstCalendarDate(
  base: Date = new Date(),
  dayOffset = 0,
): Date {
  const kst = new Date(base.getTime() + KST_OFFSET_MS);
  return new Date(
    Date.UTC(
      kst.getUTCFullYear(),
      kst.getUTCMonth(),
      kst.getUTCDate() + dayOffset,
    ),
  );
}

export function getKstMidnightInstant(
  base: Date = new Date(),
  dayOffset = 0,
): Date {
  return new Date(
    getKstCalendarDate(base, dayOffset).getTime() - KST_OFFSET_MS,
  );
}
