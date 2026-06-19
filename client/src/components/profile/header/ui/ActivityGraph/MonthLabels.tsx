import { WeekInfo } from "@/types/activity.ts";

export const MonthLabels = ({ weeks }: { weeks: WeekInfo[] }) => {
  // 각 월 라벨은 해당 월 1일이 포함된 주(열)에 배치한다.
  // 연초의 전년 12월 잔여 칸에는 1일이 없으므로 라벨이 생기지 않아 Jan과 겹치지 않는다.
  const monthPositions = weeks.reduce(
    (acc, week, index) => {
      const firstOfMonth = week.days.find((day) => !day.empty && day.date.getDate() === 1);

      if (firstOfMonth) {
        acc.push({
          month: firstOfMonth.date.toLocaleString("en-US", { month: "short" }),
          position: `${index * 0.75}rem`,
        });
      }
      return acc;
    },
    [] as Array<{ month: string; position: string }>
  );

  return (
    <div className="flex mb-5 pl-6">
      <div className="relative flex">
        {monthPositions.map(({ month, position }, index) => (
          <div key={`${month}-${index}`} className="absolute text-xs text-gray-400" style={{ left: position }}>
            {month}
          </div>
        ))}
      </div>
    </div>
  );
};
