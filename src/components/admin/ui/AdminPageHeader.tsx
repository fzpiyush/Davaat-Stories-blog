import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="min-w-0 flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-semibold text-balance text-foreground">
          {title}
        </h1>

        {description && (
          <p className="max-w-2xl text-sm leading-6 text-pretty text-muted">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </header>
  );
}
