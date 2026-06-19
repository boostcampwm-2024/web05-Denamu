import { DayLabels } from "@/components/profile/header/ui/ActivityGraph/DayLabels.tsx";
import { Legend } from "@/components/profile/header/ui/ActivityGraph/Legend.tsx";
import { MonthLabels } from "@/components/profile/header/ui/ActivityGraph/MonthLabels.tsx";
import { Week } from "@/components/profile/header/ui/ActivityGraph/Week.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";

import { processYearActivityData } from "@/utils/activity.ts";

import { cn } from "@/lib/utils.ts";

import { DailyActivity } from "@/types/profile.ts";

interface ActivityGraphProps {
  dailyActivities: DailyActivity[];
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
}

export const ActivityGraph = ({ dailyActivities, year, years, onYearChange }: ActivityGraphProps) => {
  const { weeks } = processYearActivityData(dailyActivities, year, new Date());

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg">
      <div className="flex-1 min-w-0">
        <h3 className="mb-4 text-lg font-semibold">Activity</h3>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <div className="flex flex-col">
              <MonthLabels weeks={weeks} />
              <div className="flex">
                <DayLabels />
                <div className="flex gap-0.5">
                  {weeks.map((weekInfo) => (
                    <Week key={weekInfo.weekNumber} weekInfo={weekInfo} />
                  ))}
                </div>
              </div>
            </div>
          </TooltipProvider>
          <Legend />
        </div>
      </div>

      <div className="flex flex-col flex-shrink-0 gap-2">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => onYearChange(y)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-md transition-colors",
              y === year ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
};
