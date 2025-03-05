import { WeekInfo } from "@/types/activity.ts";

export const MonthLabels = ({ weeks }: { weeks: WeekInfo[] }) => {
  const monthPositions = weeks.reduce(
    (acc, week, index) => {
      const firstDayOfWeek = week.days[0];
      const month = firstDayOfWeek.date.toLocaleString("en-US", { month: "short" });

      if (index === 0 || month !== weeks[index - 1].days[0].date.toLocaleString("en-US", { month: "short" })) {
        acc.push({
          month,
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
