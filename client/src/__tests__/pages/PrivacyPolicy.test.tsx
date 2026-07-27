import { MemoryRouter } from "react-router-dom";

import { describe, expect, it, vi } from "vitest";

import PrivacyPolicy from "@/pages/PrivacyPolicy.tsx";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("lucide-react", async () => {
  const { lucideProxy } = await import("@/__tests__/__mocks__/external/lucide-proxy.tsx");
  return lucideProxy();
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("PrivacyPolicy", () => {
  it("제목과 시행일을 렌더링해야 한다", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "개인정보처리방침" })).toBeInTheDocument();
    expect(screen.getByText(/시행일: 2026\. 08\. 01/)).toBeInTheDocument();
  });

  it("15개 조항 제목이 모두 렌더링되어야 한다", () => {
    renderPage();

    for (let i = 1; i <= 15; i++) {
      expect(screen.getByRole("heading", { level: 2, name: new RegExp(`제 ${i}조`) })).toBeInTheDocument();
    }
  });

  it("Denamu 실제 수집 항목(이메일·소셜 로그인)을 고지해야 한다", () => {
    const { container } = renderPage();

    expect(container).toHaveTextContent("이메일, 비밀번호, 닉네임");
    expect(container).toHaveTextContent("소셜 로그인 시 (Google, GitHub)");
    expect(container).toHaveTextContent("IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 브라우저 및 기기 정보");
  });

  it("문의처로 팀 이메일을 노출해야 한다", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "boostcamp9web05@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:boostcamp9web05@gmail.com"
    );
  });

  it("'메인 페이지로 돌아가기' 클릭 시 '/' 로 이동해야 한다", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /메인 페이지로 돌아가기/ }));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
