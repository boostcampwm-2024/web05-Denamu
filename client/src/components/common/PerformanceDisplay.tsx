import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { PerformanceMetrics } from "@/hooks/common/usePerformanceMeasure";

import { usePerformanceStore } from "@/store/usePerformanceStore";

interface PerformanceDisplayProps {
  intersectionMetrics: PerformanceMetrics;
  throttledScrollMetrics: PerformanceMetrics;
  rawScrollMetrics: PerformanceMetrics;
}

export const PerformanceDisplay = ({
  intersectionMetrics,
  throttledScrollMetrics,
  rawScrollMetrics,
}: PerformanceDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { resetAllMetrics } = usePerformanceStore();

  // 안전하게 숫자 포맷팅하는 함수
  const safeFormat = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "0";
    if (typeof value !== "number") return "0";
    return value.toFixed(2);
  };

  // 성능 차이 계산
  const calculateDiff = (metric1: number | null, metric2: number | null): string => {
    if (metric1 === null || metric2 === null) return "측정 중...";
    if (typeof metric1 !== "number" || typeof metric2 !== "number") return "측정 중...";
    const diff = metric1 - metric2;
    return diff === 0 ? "동일" : diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
  };

  // 측정 결과 초기화 핸들러
  const handleResetMetrics = () => {
    resetAllMetrics();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button className="fixed bottom-4 right-4 z-50 shadow-lg" onClick={() => setIsOpen(true)}>
        성능 측정 결과 보기
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-[600px] z-50 shadow-lg bg-white max-h-[80vh] overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle>무한 스크롤 성능 비교</CardTitle>
        <CardDescription>IntersectionObserver vs 스로틀링 Scroll Event vs 순수 Scroll Event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 rounded bg-blue-50">
            <h3 className="font-bold text-blue-600">IntersectionObserver</h3>
            <p>렌더링 횟수: {intersectionMetrics.renderCount}</p>
            <p>마지막 렌더링: {safeFormat(intersectionMetrics.lastRenderTime)}ms</p>
            <p>평균 렌더링: {safeFormat(intersectionMetrics.averageRenderTime)}ms</p>
            <p>총 렌더링 시간: {safeFormat(intersectionMetrics.totalRenderTime)}ms</p>
            <p>메모리: {intersectionMetrics.memoryUsage ? safeFormat(intersectionMetrics.memoryUsage) : "N/A"}MB</p>
          </div>
          <div className="p-2 rounded bg-green-50">
            <h3 className="font-bold text-green-600">스로틀링 Scroll Event</h3>
            <p>렌더링 횟수: {throttledScrollMetrics.renderCount}</p>
            <p>마지막 렌더링: {safeFormat(throttledScrollMetrics.lastRenderTime)}ms</p>
            <p>평균 렌더링: {safeFormat(throttledScrollMetrics.averageRenderTime)}ms</p>
            <p>총 렌더링 시간: {safeFormat(throttledScrollMetrics.totalRenderTime)}ms</p>
            <p>
              메모리: {throttledScrollMetrics.memoryUsage ? safeFormat(throttledScrollMetrics.memoryUsage) : "N/A"}MB
            </p>
          </div>
          <div className="p-2 rounded bg-red-50">
            <h3 className="font-bold text-red-600">순수 Scroll Event</h3>
            <p>렌더링 횟수: {rawScrollMetrics.renderCount}</p>
            <p>마지막 렌더링: {safeFormat(rawScrollMetrics.lastRenderTime)}ms</p>
            <p>평균 렌더링: {safeFormat(rawScrollMetrics.averageRenderTime)}ms</p>
            <p>총 렌더링 시간: {safeFormat(rawScrollMetrics.totalRenderTime)}ms</p>
            <p>메모리: {rawScrollMetrics.memoryUsage ? safeFormat(rawScrollMetrics.memoryUsage) : "N/A"}MB</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">성능 분석 결과</h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <h4 className="font-semibold">IntersectionObserver vs 스로틀링 Scroll</h4>
              <p>렌더링 횟수 차이: {Math.abs(intersectionMetrics.renderCount - throttledScrollMetrics.renderCount)}</p>
              <p>
                평균 렌더링 시간 차이:{" "}
                {calculateDiff(intersectionMetrics.averageRenderTime, throttledScrollMetrics.averageRenderTime)}ms
              </p>
              <p>
                총 렌더링 시간 차이:{" "}
                {calculateDiff(intersectionMetrics.totalRenderTime, throttledScrollMetrics.totalRenderTime)}ms
              </p>
            </div>

            <div>
              <h4 className="font-semibold">스로틀링 Scroll vs 순수 Scroll</h4>
              <p>렌더링 횟수 차이: {Math.abs(throttledScrollMetrics.renderCount - rawScrollMetrics.renderCount)}</p>
              <p>
                평균 렌더링 시간 차이:{" "}
                {calculateDiff(throttledScrollMetrics.averageRenderTime, rawScrollMetrics.averageRenderTime)}ms
              </p>
              <p>
                총 렌더링 시간 차이:{" "}
                {calculateDiff(throttledScrollMetrics.totalRenderTime, rawScrollMetrics.totalRenderTime)}ms
              </p>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="font-semibold">효율성 순위 (렌더링 횟수 기준)</h4>
            <ol className="list-decimal list-inside">
              {[
                { name: "IntersectionObserver", count: intersectionMetrics.renderCount },
                { name: "스로틀링 Scroll Event", count: throttledScrollMetrics.renderCount },
                { name: "순수 Scroll Event", count: rawScrollMetrics.renderCount },
              ]
                .sort((a, b) => a.count - b.count)
                .map((item, index) => (
                  <li key={index} className={index === 0 ? "font-bold" : ""}>
                    {item.name}: {item.count}회
                  </li>
                ))}
            </ol>
          </div>

          <div className="mt-3">
            <h4 className="font-semibold">효율성 순위 (평균 렌더링 시간 기준)</h4>
            <ol className="list-decimal list-inside">
              {[
                {
                  name: "IntersectionObserver",
                  time:
                    typeof intersectionMetrics.averageRenderTime === "number"
                      ? intersectionMetrics.averageRenderTime
                      : 0,
                },
                {
                  name: "스로틀링 Scroll Event",
                  time:
                    typeof throttledScrollMetrics.averageRenderTime === "number"
                      ? throttledScrollMetrics.averageRenderTime
                      : 0,
                },
                {
                  name: "순수 Scroll Event",
                  time: typeof rawScrollMetrics.averageRenderTime === "number" ? rawScrollMetrics.averageRenderTime : 0,
                },
              ]
                .sort((a, b) => a.time - b.time)
                .map((item, index) => (
                  <li key={index} className={index === 0 ? "font-bold" : ""}>
                    {item.name}: {safeFormat(item.time)}ms
                  </li>
                ))}
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
          닫기
        </Button>
        <Button variant="destructive" onClick={handleResetMetrics} className="flex-1">
          측정 결과 초기화
        </Button>
      </CardFooter>
    </Card>
  );
};
