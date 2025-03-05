import { formatActivityDate, getShortMonthName, subtractDays } from "@/utils/date.ts";

import { ActivityData, DayInfo, WeekInfo } from "@/types/activity.ts";
import { DailyActivity } from "@/types/profile.ts";
import { pipe } from "lodash/fp";

const createActivityMapFromData = (activities: DailyActivity[]): Map<string, number> =>
  new Map(activities.map((activity) => [activity.date, activity.viewCount]));

const TOTAL_DAYS = 365;

const generateDayInfo =
  (baseDate: Date, activityMap: Map<string, number>) =>
  (dayOffset: number): DayInfo => {
    const daysToAdjust = baseDate.getDay();

    const date = subtractDays(baseDate, TOTAL_DAYS - daysToAdjust - dayOffset);
    const dateStr = formatActivityDate(date);
    return {
      date,
      dateStr,
      count: activityMap.get(dateStr) || 0,
    };
  };

const generateWeekInfo =
  (baseDate: Date, activityMap: Map<string, number>) =>
  (weekNumber: number): WeekInfo => {
    const generateDay = generateDayInfo(baseDate, activityMap);
    const currentDayOfWeek = baseDate.getDay();
    const daysToAdjust = currentDayOfWeek;

    const days = Array.from({ length: 7 }, (_, day) => {
      const dayIndex = weekNumber * 7 + day;
      const date = subtractDays(baseDate, TOTAL_DAYS - daysToAdjust - dayIndex);

      if (weekNumber === 51 && day > currentDayOfWeek) {
        return null;
      }

      if (date > baseDate) {
        return null;
      }

      return dayIndex < 365 ? generateDay(dayIndex) : null;
    }).filter(Boolean) as DayInfo[];

    return { days, weekNumber };
  };

export const processActivityData = (activities: DailyActivity[], baseDate: Date): ActivityData => {
  const activityMap = createActivityMapFromData(activities);

  const processWeeks = pipe(
    () => [...Array(52)].map((_, i) => i),
    (weeks: number[]) => weeks.map((weekNumber) => generateWeekInfo(baseDate, activityMap)(weekNumber))
  );

  const processMonths = pipe(
    () => [...Array(53)].map((_, i) => i * 7),
    (indices: number[]) => indices.map((i) => subtractDays(baseDate, 364 - i)),
    (dates: Date[]) => dates.map(getShortMonthName),
    (months: string[]) => Array.from(new Set(months))
  );

  return {
    weeks: processWeeks(),
    months: processMonths(),
    activityMap,
  };
};
