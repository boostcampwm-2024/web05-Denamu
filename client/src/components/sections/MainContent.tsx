import { useState, useEffect, useCallback } from "react";

import { PerformanceDisplay } from "@/components/common/PerformanceDisplay";
import LatestSection from "@/components/sections/LatestSection";
import LatestSectionWithScroll from "@/components/sections/LatestSectionWithScroll";
import LatestSectionWithScrollRaw from "@/components/sections/LatestSectionWithScrollRaw";
import TrandingSection from "@/components/sections/TrendingSection";
import { Button } from "@/components/ui/button";

import { PerformanceMetrics } from "@/hooks/common/usePerformanceMeasure";

import { usePerformanceStore } from "@/store/usePerformanceStore";

export default function MainContent() {
  const [scrollType, setScrollType] = useState<"intersection" | "throttled" | "raw">("intersection");

  const {
    intersectionMetrics,
    throttledScrollMetrics,
    rawScrollMetrics,
    updateIntersectionMetrics,
    updateThrottledScrollMetrics,
    updateRawScrollMetrics,
  } = usePerformanceStore();

  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);

      if (args[0] && typeof args[0] === "string") {
        const metricsObject = args[1];
        if (typeof metricsObject !== "object" || metricsObject === null) return;

        const isPerformanceMetrics = (obj: unknown): obj is Partial<PerformanceMetrics> => {
          return (
            obj !== null &&
            typeof obj === "object" &&
            ("renderCount" in obj ||
              "lastRenderTime" in obj ||
              "averageRenderTime" in obj ||
              "totalRenderTime" in obj ||
              "memoryUsage" in obj)
          );
        };

        if (!isPerformanceMetrics(metricsObject)) return;

        if (args[0].includes("IntersectionObserver-based")) {
          if (args[0].includes("Final Metrics")) {
            updateIntersectionMetrics(metricsObject);
          } else {
            updateIntersectionMetrics(metricsObject);
          }
        } else if (args[0].includes("Throttled-Scroll-Event-based")) {
          if (args[0].includes("Final Metrics")) {
            updateThrottledScrollMetrics(metricsObject);
          } else {
            updateThrottledScrollMetrics(metricsObject);
          }
        } else if (args[0].includes("Raw-Scroll-Event-based")) {
          if (args[0].includes("Final Metrics")) {
            updateRawScrollMetrics(metricsObject);
          } else {
            updateRawScrollMetrics(metricsObject);
          }
        }
      }
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, [updateIntersectionMetrics, updateThrottledScrollMetrics, updateRawScrollMetrics]);

  const handleScrollTypeChange = useCallback((type: "intersection" | "throttled" | "raw") => {
    setScrollType(type);
  }, []);

  const renderScrollComponent = () => {
    switch (scrollType) {
      case "intersection":
        return <LatestSection />;
      case "throttled":
        return <LatestSectionWithScroll />;
      case "raw":
        return <LatestSectionWithScrollRaw />;
      default:
        return <LatestSection />;
    }
  };

  return (
    <div className="flex flex-col p-8 gap-8">
      <div className="flex justify-center gap-4 mb-4">
        <Button
          variant={scrollType === "intersection" ? "default" : "outline"}
          onClick={() => handleScrollTypeChange("intersection")}
        >
          IntersectionObserver 방식
        </Button>
        <Button
          variant={scrollType === "throttled" ? "default" : "outline"}
          onClick={() => handleScrollTypeChange("throttled")}
        >
          스로틀링 Scroll Event 방식
        </Button>
        <Button variant={scrollType === "raw" ? "default" : "outline"} onClick={() => handleScrollTypeChange("raw")}>
          순수 Scroll Event 방식
        </Button>
      </div>
      <TrandingSection />
      {renderScrollComponent()}

      <PerformanceDisplay
        intersectionMetrics={intersectionMetrics}
        throttledScrollMetrics={throttledScrollMetrics}
        rawScrollMetrics={rawScrollMetrics}
      />
    </div>
  );
}
