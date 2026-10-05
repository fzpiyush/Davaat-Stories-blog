import type { ReactNode } from "react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function AdminEmptyState({
  title,
  description,
  children,
}: AdminEmptyStateProps) {
  return (
    <div className="w-full px-6 py-12 flex flex-col items-center gap-3 text-center bg-surface border border-dashed border-border rounded-xl">
      <h2 className="font-serif text-xl text-balance text-foreground">
        {title}
      </h2>

      <p className="max-w-md text-sm leading-6 text-pretty text-muted">
        {description}
      </p>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}