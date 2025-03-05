import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

import { getColorClass } from "@/utils/color.ts";

import { DayInfo } from "@/types/activity.ts";

export const DayCell = ({ dayInfo }: { dayInfo: DayInfo }) => (
  <Tooltip delayDuration={200}>
    <TooltipTrigger>
      <div className={`w-2.5 h-2.5 rounded-sm ${getColorClass(dayInfo.count)}`} />
    </TooltipTrigger>
    <TooltipContent>
      <p>{`${dayInfo.dateStr}: ${dayInfo.count} views`}</p>
    </TooltipContent>
  </Tooltip>
);
