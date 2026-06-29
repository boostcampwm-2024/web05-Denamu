import { describe, expect, it } from "vitest";

import { ProfileHeader } from "@/components/profile/ProfileHeader.tsx";

import { render, screen } from "@testing-library/react";

describe("ProfileHeader", () => {
  it("이름, 이메일, 자기소개를 렌더링해야 한다", () => {
    render(<ProfileHeader name="민석" email="min@test.com" profileImage="img.png" introduction="안녕하세요" />);

    expect(screen.getByRole("heading", { name: "민석" })).toBeInTheDocument();
    expect(screen.getByText("min@test.com")).toBeInTheDocument();
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-image")).toHaveAttribute("src", "img.png");
  });

  it("자기소개가 없으면 기본 안내 문구를 표시해야 한다", () => {
    render(<ProfileHeader name="민석" email="min@test.com" profileImage={null} introduction={null} />);

    expect(screen.getByText("자기소개가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
  });

  it("이름이 없으면 fallback에 '사용자'를 표시해야 한다", () => {
    render(<ProfileHeader name="" email="" profileImage={null} introduction={null} />);

    expect(screen.getByText("사용자")).toBeInTheDocument();
  });
});
