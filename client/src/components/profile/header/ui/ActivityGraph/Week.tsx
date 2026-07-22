import { DayCell } from "@/components/profile/header/ui/ActivityGraph/DayCell.tsx";

import { ActivityScale } from "@/utils/color.ts";

import { WeekInfo } from "@/types/activity.ts";

export const Week = ({
  weekInfo,
  scale,
  selectedDate,
  onDayClick,
}: {
  weekInfo: WeekInfo;
  scale?: ActivityScale;
  selectedDate?: string | null;
  onDayClick?: (dateStr: string) => void;
}) => (
  <div className="grid grid-rows-7 gap-0.5">
    {weekInfo.days.map((day) => (
      <DayCell
        key={day.dateStr}
        dayInfo={day}
        scale={scale}
        selected={day.dateStr === selectedDate}
        onDayClick={onDayClick}
      />
    ))}
  </div>
);
