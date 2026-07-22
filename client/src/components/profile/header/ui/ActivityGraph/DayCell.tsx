import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

import { ActivityScale, getScaleColorClass } from "@/utils/color.ts";

import { DayInfo } from "@/types/activity.ts";

export const DayCell = ({
  dayInfo,
  unit = "views",
  scale = "views",
}: {
  dayInfo: DayInfo;
  unit?: string;
  scale?: ActivityScale;
}) => {
  if (dayInfo.empty) {
    return <div className="w-2.5 h-2.5" />;
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger>
        <div className={`w-2.5 h-2.5 rounded-sm ${getScaleColorClass(dayInfo.count, scale)}`} />
      </TooltipTrigger>
      <TooltipContent>
        <p>{`${dayInfo.dateStr}: ${dayInfo.count} ${unit}`}</p>
      </TooltipContent>
    </Tooltip>
  );
};
