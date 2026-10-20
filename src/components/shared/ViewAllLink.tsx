import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

import { buttonClass } from "@/lib/admin/ui";

interface ViewAllLinkProps {
  href: string;
  label: string;
  className?: string;
}

export default function ViewAllLink({
  href,
  label,
  className = "",
}: ViewAllLinkProps) {
  return (
    <Link
      href={href}
      className={`${buttonClass.secondary} w-fit group ${className}`.trim()}
    >
      {label}
      <ArrowRightIcon
        aria-hidden="true"
        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </Link>
  );
}
