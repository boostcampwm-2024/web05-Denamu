import { Footer } from "@/components/about/Footer";

import { useScrollDirection } from "@/hooks/common/useScrollDirection";

export default function ScrollAwareFooter() {
  const direction = useScrollDirection();
  const isHidden = direction === "down";

  return (
    <div
      data-testid="scroll-aware-footer"
      aria-hidden={isHidden}
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out ${
        isHidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <Footer />
    </div>
  );
}
