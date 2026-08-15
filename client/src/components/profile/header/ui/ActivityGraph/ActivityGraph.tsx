import { DayLabels } from "@/components/profile/header/ui/ActivityGraph/DayLabels.tsx";
import { Legend } from "@/components/profile/header/ui/ActivityGraph/Legend.tsx";
import { MonthLabels } from "@/components/profile/header/ui/ActivityGraph/MonthLabels.tsx";
import { Week } from "@/components/profile/header/ui/ActivityGraph/Week.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";

import { processYearActivityData } from "@/utils/activity.ts";
import { ActivityScale } from "@/utils/color.ts";

import { cn } from "@/lib/utils.ts";
import { DailyActivity } from "@/types/profile.ts";

interface ActivityGraphProps {
  dailyActivities: DailyActivity[];
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
  scale?: ActivityScale;
  selectedDate?: string | null;
  onDayClick?: (dateStr: string) => void;
}

export const ActivityGraph = ({
  dailyActivities,
  year,
  years,
  onYearChange,
  scale,
  selectedDate,
  onDayClick,
}: ActivityGraphProps) => {
  const { weeks } = processYearActivityData(dailyActivities, year, new Date());

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <p className="mb-4 text-xs font-semibold tracking-wider text-[#FF870D] uppercase">Activity</p>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <div className="flex flex-col">
              <MonthLabels weeks={weeks} />
              <div className="flex">
                <DayLabels />
                <div className="flex gap-0.5">
                  {weeks.map((weekInfo) => (
                    <Week
                      key={weekInfo.weekNumber}
                      weekInfo={weekInfo}
                      scale={scale}
                      selectedDate={selectedDate}
                      onDayClick={onDayClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TooltipProvider>
          <Legend scale={scale} />
        </div>
      </div>

      <div className="flex flex-col flex-shrink-0 gap-2">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => onYearChange(y)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-md transition-colors",
              y === year ? "bg-[#FF870D] text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
};
