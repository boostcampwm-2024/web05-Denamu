import { describe, expect, it } from "vitest";

import { NoticeContent } from "@/components/notice/NoticeContent.tsx";

import { render, screen } from "@testing-library/react";

describe("NoticeContent", () => {
  it("script 태그를 제거하고 안전한 태그만 렌더링해야 한다", () => {
    render(<NoticeContent content='<p>안내</p><script>alert("xss")</script>' />);

    expect(screen.getByText("안내")).toBeInTheDocument();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  it("onerror 같은 이벤트 핸들러 속성을 제거해야 한다", () => {
    render(<NoticeContent content='<img src="x" onerror="alert(1)" />' />);

    const img = document.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("onerror")).toBeNull();
  });

  it("일반 서식 태그(b, a)는 그대로 렌더링해야 한다", () => {
    render(<NoticeContent content='<b>굵게</b> <a href="https://denamu.dev">링크</a>' />);

    expect(screen.getByText("굵게").tagName).toBe("B");
    expect(screen.getByText("링크")).toHaveAttribute("href", "https://denamu.dev");
  });
});
