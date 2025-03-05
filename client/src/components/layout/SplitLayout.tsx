import * as React from "react";

export default function SplitLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-stretch">{children}</div>;
}
