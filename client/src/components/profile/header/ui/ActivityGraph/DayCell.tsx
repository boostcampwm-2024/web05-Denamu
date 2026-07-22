import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

import { ActivityScale, getScaleColorClass } from "@/utils/color.ts";

import { cn } from "@/lib/utils.ts";

import { DayInfo } from "@/types/activity.ts";

export const DayCell = ({
  dayInfo,
  scale = "views",
  selected = false,
  onDayClick,
}: {
  dayInfo: DayInfo;
  scale?: ActivityScale;
  selected?: boolean;
  onDayClick?: (dateStr: string) => void;
}) => {
  if (dayInfo.empty) {
    return <div className="w-2.5 h-2.5" />;
  }

  const clickable = !!onDayClick && dayInfo.count > 0;

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger onClick={clickable ? () => onDayClick(dayInfo.dateStr) : undefined}>
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-sm",
            getScaleColorClass(dayInfo.count, scale),
            clickable && "cursor-pointer",
            selected && "ring-1 ring-blue-500 ring-offset-1"
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{`${dayInfo.dateStr}: ${dayInfo.count} ${scale}`}</p>
      </TooltipContent>
    </Tooltip>
  );
};
