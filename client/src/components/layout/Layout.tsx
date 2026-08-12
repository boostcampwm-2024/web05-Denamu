import { Footer } from "@/components/about/Footer";
import Header from "@/components/layout/Header";

interface LayoutProps {
  children: React.ReactNode;
  footer?: boolean;
}

export default function Layout({ children, footer = false }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex-1">
        <div className="mx-auto max-w-7xl px-0 md:px-8">{children}</div>
      </main>
      {footer && <Footer />}
    </div>
  );
}
