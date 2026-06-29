import { Component, useEffect, useRef, type ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { action } from "storybook/actions";

import { Toaster } from "@/components/ui/toaster";

import "../src/index.css";
import { mockApi } from "@/__storybook__/mockApi";
import { queryClient } from "@/__storybook__/queryClient";
import { setupMocks } from "@/api/mocks";
import type { Preview } from "@storybook/react-vite";
import { QueryClientProvider } from "@tanstack/react-query";

setupMocks();

(window as unknown as { Kakao: Record<string, unknown> }).Kakao = {
  init: () => {},
  cleanup: () => {},
  isInitialized: () => true,
  Share: { sendDefault: () => {} },
};

const logNavigate = action("NAVIGATE");
const NavigationLogger = () => {
  const location = useLocation();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    logNavigate(`${location.pathname}${location.search}`);
  }, [location]);
  return null;
};

class StoryErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div data-sb-render-error style={{ color: "#b91c1c", padding: 16, fontFamily: "monospace" }}>
          {String(this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },

  beforeEach: async () => {
    mockApi.reset();
    queryClient.clear();
  },

  decorators: [
    (Story, context) => {
      const router = (context.parameters?.router ?? {}) as { initialEntries?: string[]; path?: string };
      const entries = router.initialEntries ?? ["/"];
      return (
        <StoryErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={entries}>
              <NavigationLogger />
              {router.path ? (
                <Routes>
                  <Route path={router.path} element={<Story />} />
                </Routes>
              ) : (
                <Story />
              )}
              <Toaster />
            </MemoryRouter>
          </QueryClientProvider>
        </StoryErrorBoundary>
      );
    },
  ],
};

export default preview;
