import { useState, useEffect, useCallback, useRef } from "react";

/**
 * 스로틀링 없는 순수 Scroll Event 기반 무한 스크롤 훅
 * @param fetchNextPage 다음 페이지를 불러오는 함수
 * @param hasNextPage 다음 페이지가 있는지 여부
 * @param isFetchingNextPage 다음 페이지를 불러오는 중인지 여부
 * @param threshold 스크롤 위치가 하단에서 얼마나 떨어져 있을 때 다음 페이지를 불러올지 결정하는 값 (0~1)
 */
export const useScrollInfiniteRaw = (
  fetchNextPage: () => void,
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
  threshold: number = 0.8
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

  useEffect(() => {
    window.addEventListener("scroll", checkScrollPosition, { passive: true });

    checkScrollPosition();

    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  return { isNearBottom };
};
