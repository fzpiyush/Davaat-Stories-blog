import type { ReactNode } from "react";
import Link from "next/link";

import PublicFooter from "@/components/public/PublicFooter";
import PublicHeader from "@/components/public/PublicHeader";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({
  children,
}: Readonly<PublicLayoutProps>) {
  return (
    <div className="w-full min-h-dvh flex flex-col text-foreground bg-background">
      <Link
        href="#main-content"
        className="px-4 py-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
      >
        Skip to content
      </Link>

      <PublicHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="w-full flex flex-1 flex-col focus:outline-none"
      >
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
