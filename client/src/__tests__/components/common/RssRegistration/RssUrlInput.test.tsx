import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

vi.unmock("@/components/RssRegistration/RssUrlInput");

import { RssUrlInput } from "@/components/RssRegistration/RssUrlInput";

describe("RssUrlInput", () => {
  it("플랫폼의 prefix/suffix/placeholder를 렌더링해야 한다 (tistory)", () => {
    render(<RssUrlInput platform="tistory" value="" onChange={vi.fn()} />);

    expect(screen.getByText("https://")).toBeInTheDocument();
    expect(screen.getByText(".tistory.com/rss")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("서브도메인")).toBeInTheDocument();
  });

  it("suffix가 없는 플랫폼은 suffix 영역을 렌더링하지 않아야 한다 (velog)", () => {
    render(<RssUrlInput platform="velog" value="" onChange={vi.fn()} />);

    expect(screen.getByText("https://v2.velog.io/rss/@")).toBeInTheDocument();
    expect(screen.queryByText(".tistory.com/rss")).not.toBeInTheDocument();
  });

  it("입력 시 onChange를 호출해야 한다", () => {
    const onChange = vi.fn();
    render(<RssUrlInput platform="tistory" value="" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText("서브도메인"), { target: { value: "myblog" } });

    expect(onChange).toHaveBeenCalled();
  });
});
