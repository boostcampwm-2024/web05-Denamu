import { create } from "zustand";

import { PerformanceMetrics } from "@/hooks/common/usePerformanceMeasure";

import { persist, createJSONStorage } from "zustand/middleware";

const initialMetrics: PerformanceMetrics = {
  renderCount: 0,
  lastRenderTime: null,
  averageRenderTime: null,
  totalRenderTime: 0,
  memoryUsage: null,
};

interface PerformanceState {
  intersectionMetrics: PerformanceMetrics;
  throttledScrollMetrics: PerformanceMetrics;
  rawScrollMetrics: PerformanceMetrics;
  updateIntersectionMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  updateThrottledScrollMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  updateRawScrollMetrics: (metrics: Partial<PerformanceMetrics>) => void;
  resetAllMetrics: () => void;
}

const extractNumberFromString = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/^([\d.]+)/);
    if (match) {
      return parseFloat(match[1]);
    }
  }
  return null;
};

const normalizeMetrics = (metrics: Partial<PerformanceMetrics>): Partial<PerformanceMetrics> => {
  const normalized: Partial<PerformanceMetrics> = { ...metrics };

  if ("lastRenderTime" in metrics) {
    normalized.lastRenderTime = extractNumberFromString(metrics.lastRenderTime);
  }

  if ("averageRenderTime" in metrics) {
    normalized.averageRenderTime = extractNumberFromString(metrics.averageRenderTime);
  }

  if ("totalRenderTime" in metrics && metrics.totalRenderTime !== undefined) {
    const extractedValue = extractNumberFromString(metrics.totalRenderTime);
    normalized.totalRenderTime = extractedValue !== null ? extractedValue : 0;
  }

  if ("memoryUsage" in metrics) {
    normalized.memoryUsage = extractNumberFromString(metrics.memoryUsage);
  }

  return normalized;
};

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set) => ({
      intersectionMetrics: { ...initialMetrics },
      throttledScrollMetrics: { ...initialMetrics },
      rawScrollMetrics: { ...initialMetrics },

      updateIntersectionMetrics: (metrics) =>
        set((state) => ({
          intersectionMetrics: { ...state.intersectionMetrics, ...normalizeMetrics(metrics) },
        })),

      updateThrottledScrollMetrics: (metrics) =>
        set((state) => ({
          throttledScrollMetrics: { ...state.throttledScrollMetrics, ...normalizeMetrics(metrics) },
        })),

      updateRawScrollMetrics: (metrics) =>
        set((state) => ({
          rawScrollMetrics: { ...state.rawScrollMetrics, ...normalizeMetrics(metrics) },
        })),

      resetAllMetrics: () =>
        set({
          intersectionMetrics: { ...initialMetrics },
          throttledScrollMetrics: { ...initialMetrics },
          rawScrollMetrics: { ...initialMetrics },
        }),
    }),
    {
      name: "performance-metrics-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
