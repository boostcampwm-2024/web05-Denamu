import { describe, it, expect, vi } from "vitest";

import { FormInput } from "@/components/RssRegistration/FormInput";

import { render, screen, fireEvent } from "@testing-library/react";

describe("FormInput", () => {
  it("label과 input이 htmlFor로 올바르게 연결되어야 한다", () => {
    render(<FormInput id="test" type="text" label="테스트" value="" placeholder="test" onChange={() => {}} />);

    const label = screen.getByText("테스트");
    const input = screen.getByRole("textbox");

    expect(label).toHaveAttribute("for", "test");
    expect(input).toHaveAttribute("id", "test");
  });

  it("value prop이 입력 필드에 정확히 반영되어야 한다", () => {
    render(<FormInput id="test" type="text" label="테스트" value="초기값" placeholder="test" onChange={() => {}} />);

    expect(screen.getByRole("textbox")).toHaveValue("초기값");
  });

  it("onChange 핸들러가 입력값 변경을 정확히 전달해야 한다", () => {
    const handleChange = vi.fn();
    render(<FormInput id="test" type="text" label="테스트" value="" placeholder="test" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "테스트" } });

    expect(handleChange).toHaveBeenCalledWith("테스트");
  });

  it("email 타입은 이메일 입력 필드로 렌더링되어야 한다", () => {
    render(
      <FormInput id="email" type="email" label="이메일" value="" placeholder="test@example.com" onChange={() => {}} />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("일반 텍스트 입력은 text 타입으로 렌더링되어야 한다", () => {
    render(<FormInput id="name" type="text" label="이름" value="" placeholder="이름 입력" onChange={() => {}} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "text");
  });

  it("빈 값일 때 placeholder가 보여야 한다", () => {
    render(<FormInput id="test" type="text" label="테스트" value="" placeholder="안내문구" onChange={() => {}} />);

    expect(screen.getByPlaceholderText("안내문구")).toBeInTheDocument();
  });
});
