import { useState, useEffect, useRef } from "react";

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number | null;
  averageRenderTime: number | null;
  totalRenderTime: number;
  memoryUsage: number | null;
}

export const usePerformanceMeasure = (enabled: boolean = true): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: null,
    averageRenderTime: null,
    totalRenderTime: 0,
    memoryUsage: null,
  });

  const startTimeRef = useRef<number | null>(null);
  const renderCountRef = useRef(0);
  const totalRenderTimeRef = useRef(0);
  const lastRenderTimeRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    return () => {
      const averageRenderTime = renderCountRef.current > 0 ? totalRenderTimeRef.current / renderCountRef.current : null;

      setMetrics({
        renderCount: renderCountRef.current,
        lastRenderTime: lastRenderTimeRef.current,
        averageRenderTime,
        totalRenderTime: totalRenderTimeRef.current,
        memoryUsage: metrics.memoryUsage,
      });
    };
  }, []);

  if (enabled && isFirstRenderRef.current) {
    startTimeRef.current = performance.now();
    isFirstRenderRef.current = false;
  } else if (enabled && startTimeRef.current !== null) {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;

    renderCountRef.current += 1;
    totalRenderTimeRef.current += renderTime;
    lastRenderTimeRef.current = renderTime;

    let memoryUsage = null;
    const extendedPerformance = performance as ExtendedPerformance;
    if (extendedPerformance.memory) {
      memoryUsage = extendedPerformance.memory.usedJSHeapSize / (1024 * 1024);
    }

    const averageRenderTime = totalRenderTimeRef.current / renderCountRef.current;

    if (renderCountRef.current % 10 === 0 || renderCountRef.current <= 5) {
      const updatedMetrics: PerformanceMetrics = {
        renderCount: renderCountRef.current,
        lastRenderTime: renderTime,
        averageRenderTime: averageRenderTime,
        totalRenderTime: totalRenderTimeRef.current,
        memoryUsage,
      };

      startTimeRef.current = performance.now();

      setMetrics(updatedMetrics);
    } else {
      startTimeRef.current = performance.now();
    }
  }

  return metrics;
};
