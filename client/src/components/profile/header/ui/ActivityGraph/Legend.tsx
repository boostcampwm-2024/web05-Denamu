import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";

import { ActivityScale } from "@/utils/color.ts";

// getScaleColorClass의 단계 구간과 동일하게 유지해야 한다.
const LEGEND_STEPS: Record<ActivityScale, { colorClass: string; label: string }[]> = {
  views: [
    { colorClass: "bg-gray-100", label: "0" },
    { colorClass: "bg-green-200", label: "1-4" },
    { colorClass: "bg-green-300", label: "5-9" },
    { colorClass: "bg-green-400", label: "10-19" },
    { colorClass: "bg-green-500", label: "20+" },
  ],
  posts: [
    { colorClass: "bg-gray-100", label: "0" },
    { colorClass: "bg-green-200", label: "1" },
    { colorClass: "bg-green-300", label: "2" },
    { colorClass: "bg-green-400", label: "3-4" },
    { colorClass: "bg-green-500", label: "5+" },
  ],
};

export const Legend = ({ scale = "views" }: { scale?: ActivityScale }) => (
  <div className="mt-4 flex items-center text-xs text-gray-500 space-x-2">
    <span>Less</span>
    <div className="flex space-x-0.5">
      <TooltipProvider>
        {LEGEND_STEPS[scale].map((step) => (
          <Tooltip key={step.colorClass} delayDuration={200}>
            <TooltipTrigger>
              <div className={`w-3 h-3 ${step.colorClass} rounded-sm`} />
            </TooltipTrigger>
            <TooltipContent>
              <p>{`${step.label} ${scale}`}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
    <span>More</span>
  </div>
);
