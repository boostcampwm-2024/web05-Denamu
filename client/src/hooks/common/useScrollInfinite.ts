import { useState, useEffect, useCallback, useRef } from "react";

function throttle<T extends (...args: unknown[]) => unknown>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Scroll event 기반 무한 스크롤 훅
 * @param fetchNextPage 다음 페이지를 불러오는 함수
 * @param hasNextPage 다음 페이지가 있는지 여부
 * @param isFetchingNextPage 다음 페이지를 불러오는 중인지 여부
 * @param threshold 스크롤 위치가 하단에서 얼마나 떨어져 있을 때 다음 페이지를 불러올지 결정하는 값 (0~1)
 * @param throttleMs 스크롤 이벤트 스로틀링 시간 (ms)
 */
export const useScrollInfinite = (
  fetchNextPage: () => void,
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
  threshold: number = 0.8,
  throttleMs: number = 200
) => {
  const [isNearBottom, setIsNearBottom] = useState(false);
  const fetchingRef = useRef(false);

  const checkScrollPosition = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollPosition = scrollTop + clientHeight;
    const scrollThreshold = scrollHeight * threshold;
    const nearBottom = scrollPosition >= scrollThreshold;
    setIsNearBottom(nearBottom);

    if (nearBottom && hasNextPage && !isFetchingNextPage && !fetchingRef.current) {
      fetchingRef.current = true;
      fetchNextPage();
      setTimeout(() => {
        fetchingRef.current = false;
      }, 300);
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, threshold]);

  const throttledScrollHandler = useCallback(
    throttle(() => {
      checkScrollPosition();
    }, throttleMs),
    [checkScrollPosition, throttleMs]
  );

  useEffect(() => {
    window.addEventListener("scroll", throttledScrollHandler, { passive: true });

    checkScrollPosition();

    return () => {
      window.removeEventListener("scroll", throttledScrollHandler);
    };
  }, [throttledScrollHandler, checkScrollPosition]);

  return { isNearBottom };
};
