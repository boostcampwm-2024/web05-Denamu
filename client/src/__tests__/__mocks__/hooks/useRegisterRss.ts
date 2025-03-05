import { vi } from "vitest";

export const mockUseRegisterRss = {
  useRegisterRss: (onSuccess: () => void, onError: () => void) => ({
    mutate: vi.fn().mockImplementation((data) => {
      if (data.email && data.name) {
        onSuccess();
      } else {
        onError();
      }
    }),
  }),
};
