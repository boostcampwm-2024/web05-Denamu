import type { ReactNode } from "react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useVisitStore } from "@/store/useVisitStore";

import { MemoryRouter } from "react-router-dom";
import { renderHook } from "@testing-library/react";

vi.mock("@/hooks/common/useMediaQuery", () => ({ useMediaQuery: () => false }));

const createWrapper = (path: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  );
  return wrapper;
};

describe("useAppInitialization", () => {
  beforeEach(() => {
    useVisitStore.setState({ hasVisited: false });
  });

  it("첫 방문이고 경로가 '/'이면 about 페이지로 리다이렉트한다", () => {
    const { result } = renderHook(() => useAppInitialization(), { wrapper: createWrapper("/") });

    expect(result.current.shouldRedirectToAbout).toBe(true);
  });

  it("첫 방문이어도 게시글 ID로 바로 접근하면 리다이렉트하지 않는다", () => {
    const { result } = renderHook(() => useAppInitialization(), { wrapper: createWrapper("/123") });

    expect(result.current.shouldRedirectToAbout).toBe(false);
  });
});
