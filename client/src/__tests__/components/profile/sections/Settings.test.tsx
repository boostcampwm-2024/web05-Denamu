import { describe, expect, it } from "vitest";

import { Settings } from "@/components/profile/sections/Settings.tsx";

import { render, screen } from "@testing-library/react";

describe("Profile Settings", () => {
  it("'설정' 섹션을 렌더링해야 한다", () => {
    render(<Settings />);

    expect(screen.getByText("설정")).toBeInTheDocument();
  });
});
