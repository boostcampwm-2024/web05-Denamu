import { DayCell } from "@/components/profile/header/ui/ActivityGraph/DayCell.tsx";

import { ActivityScale } from "@/utils/color.ts";

import { WeekInfo } from "@/types/activity.ts";

export const Week = ({
  weekInfo,
  unit,
  scale,
}: {
  weekInfo: WeekInfo;
  unit?: string;
  scale?: ActivityScale;
}) => (
  <div className="grid grid-rows-7 gap-0.5">
    {weekInfo.days.map((day) => (
      <DayCell key={day.dateStr} dayInfo={day} unit={unit} scale={scale} />
    ))}
  </div>
);
