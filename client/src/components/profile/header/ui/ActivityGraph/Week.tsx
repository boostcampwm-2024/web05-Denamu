import { DayCell } from "@/components/profile/header/ui/ActivityGraph/DayCell.tsx";

import { WeekInfo } from "@/types/activity.ts";

export const Week = ({ weekInfo }: { weekInfo: WeekInfo }) => (
  <div className="grid grid-rows-7 gap-0.5">
    {weekInfo.days.map((day) => (
      <DayCell key={day.dateStr} dayInfo={day} />
    ))}
  </div>
);
