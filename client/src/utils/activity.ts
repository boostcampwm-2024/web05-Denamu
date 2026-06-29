import { formatActivityDate } from "@/utils/date.ts";

import { ActivityData, DayInfo, WeekInfo } from "@/types/activity.ts";
import { DailyActivity } from "@/types/profile.ts";

const createActivityMapFromData = (activities: DailyActivity[]): Map<string, number> =>
  new Map(activities.map((activity) => [activity.date, activity.viewCount]));

// 선택한 연도(1/1~12/31)를 GitHub 잔디 형태로 가공한다.
// 첫/마지막 주의 빈 칸과 미래 날짜는 empty 셀로 채워 요일 정렬을 유지한다.
export const processYearActivityData = (
  activities: DailyActivity[],
  year: number,
  today: Date
): ActivityData => {
  const activityMap = createActivityMapFromData(activities);

  const jan1 = new Date(year, 0, 1);
  const dec31 = new Date(year, 11, 31);

  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay()); // 1월 1일이 속한 주의 일요일

  const end = new Date(dec31);
  end.setDate(dec31.getDate() + (6 - dec31.getDay())); // 12월 31일이 속한 주의 토요일

  const weeks: WeekInfo[] = [];
  const cursor = new Date(start);
  let weekNumber = 0;

  while (cursor <= end) {
    const days: DayInfo[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cursor);
      const dateStr = formatActivityDate(date);
      const inYear = date >= jan1 && date <= dec31;
      const future = date > today;

      if (!inYear || future) {
        days.push({ date, dateStr: `empty-${weekNumber}-${d}`, count: 0, empty: true });
      } else {
        days.push({ date, dateStr, count: activityMap.get(dateStr) || 0 });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push({ days, weekNumber });
    weekNumber++;
  }

  return { weeks, months: [], activityMap };
};
