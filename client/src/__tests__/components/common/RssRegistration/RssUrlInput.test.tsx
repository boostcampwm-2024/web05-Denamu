import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

vi.unmock("@/components/RssRegistration/RssUrlInput");

import { RssUrlInput } from "@/components/RssRegistration/RssUrlInput";

describe("RssUrlInput", () => {
  it("prefix/suffix/placeholder를 렌더링해야 한다 (tistory)", () => {
    render(
      <RssUrlInput prefix="https://" suffix=".tistory.com" placeholder="서브도메인" value="" onChange={vi.fn()} />
    );

    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByText(".tistory.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("서브도메인")).toBeInTheDocument();
  });

  it("suffix가 없으면 suffix 영역을 렌더링하지 않아야 한다 (velog)", () => {
    render(<RssUrlInput prefix="https://velog.io/@" suffix="" placeholder="사용자명" value="" onChange={vi.fn()} />);

    expect(screen.getByText("https://velog.io/@")).toBeInTheDocument();
    expect(screen.queryByText(".tistory.com")).not.toBeInTheDocument();
  });

  it("입력 시 onChange를 호출해야 한다", () => {
    const onChange = vi.fn();
    render(
      <RssUrlInput prefix="https://" suffix=".tistory.com" placeholder="서브도메인" value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByPlaceholderText("서브도메인"), { target: { value: "myblog" } });

    expect(onChange).toHaveBeenCalledWith("myblog");
  });
});
