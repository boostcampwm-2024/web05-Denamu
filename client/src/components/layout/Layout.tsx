import Header from "@/components/layout/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="w-full">
        <div className="mx-auto max-w-7xl px-0 md:px-8">{children}</div>
      </main>
    </>
  );
}
