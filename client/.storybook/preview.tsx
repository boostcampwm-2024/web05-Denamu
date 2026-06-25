import { Component, type ReactNode } from "react";

import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";

import { setupMocks } from "@/api/mocks";
import { mockApi } from "@/__storybook__/mockApi";

import "../src/index.css";

setupMocks();

// Kakao SDK stub so share-related components render in isolation.
(window as unknown as { Kakao: Record<string, unknown> }).Kakao = {
  init: () => {},
  cleanup: () => {},
  isInitialized: () => true,
  Share: { sendDefault: () => {} },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

// Renders a deterministic DOM marker on render-phase throws so story health
// can be asserted reliably (used by the render sweep, harmless otherwise).
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

  // Reset mocked API + query cache before every story so success/error states
  // configured by a story's own beforeEach never leak into the next.
  beforeEach: async () => {
    mockApi.reset();
    queryClient.clear();
  },

  decorators: [
    // Single Router for all stories. A story sets `parameters.router` to drive
    // the URL (query params via initialEntries) or match a path (useParams).
    (Story, context) => {
      const router = (context.parameters?.router ?? {}) as { initialEntries?: string[]; path?: string };
      const entries = router.initialEntries ?? ["/"];
      return (
        <StoryErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={entries}>
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
