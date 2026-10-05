import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

interface BackLinkProps {
  href: string;
  children: ReactNode;
}

export default function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="w-fit inline-flex items-center gap-1.5 text-sm text-muted rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
    >
      <ArrowLeftIcon
        aria-hidden="true"
        className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
      />
      {children}
    </Link>
  );
}
