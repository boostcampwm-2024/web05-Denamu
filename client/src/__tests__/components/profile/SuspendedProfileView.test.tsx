import { describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { SuspendedProfileView } from "@/components/profile/SuspendedProfileView.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();

vi.mock("lucide-react", () => lucideProxy());
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

describe("SuspendedProfileView", () => {
  it("정지 안내 문구와 홈으로 버튼을 렌더링해야 한다", () => {
    render(<SuspendedProfileView />);

    expect(screen.getByText("정지 처리된 유저입니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈으로" })).toBeInTheDocument();
  });

  it("홈으로 버튼 클릭 시 /로 이동해야 한다", () => {
    render(<SuspendedProfileView />);

    fireEvent.click(screen.getByRole("button", { name: "홈으로" }));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
