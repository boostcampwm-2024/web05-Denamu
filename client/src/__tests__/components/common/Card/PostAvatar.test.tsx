import { describe, expect, it } from "vitest";

import PostAvatar from "@/components/common/Card/PostAvatar.tsx";

import { render, screen } from "@testing-library/react";

describe("PostAvatar", () => {
  it("유효한 플랫폼이면 플랫폼 아이콘 이미지를 렌더링해야 한다", () => {
    render(<PostAvatar author="작성자" className="cls" blogPlatform="tistory" />);

    const img = screen.getByRole("img", { name: "작성자" });
    expect(img).toHaveAttribute("src", expect.stringContaining("tistory-icon.svg"));
  });

  it("유효하지 않은 플랫폼이면 작성자 이니셜 fallback을 렌더링해야 한다", () => {
    render(<PostAvatar author="dragon" className="cls" blogPlatform="etc" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("D");
  });

  it("author가 없으면 fallback에 '?'를 표시해야 한다", () => {
    render(<PostAvatar author="" className="cls" blogPlatform="unknown" />);

    expect(screen.getByTestId("avatar-fallback")).toHaveTextContent("?");
  });
});
