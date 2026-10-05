export type ButtonVariant = "primary" | "secondary" | "danger";

export const buttonClass: Record<ButtonVariant, string> = {
  primary:
    "h-11 px-5 inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "h-11 px-5 inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed",
  danger:
    "h-11 px-5 inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium text-red-600 bg-background border border-red-600/30 rounded-lg transition-colors hover:bg-red-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-60 disabled:cursor-not-allowed",
};

export const smallButtonClass: Record<ButtonVariant, string> = {
  primary:
    "h-9 px-3 inline-flex shrink-0 items-center justify-center gap-1.5 text-sm font-medium text-accent-foreground bg-accent rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed",
  secondary:
    "h-9 px-3 inline-flex shrink-0 items-center justify-center gap-1.5 text-sm font-medium text-foreground bg-background border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60 disabled:cursor-not-allowed",
  danger:
    "h-9 px-3 inline-flex shrink-0 items-center justify-center gap-1.5 text-sm font-medium text-red-600 bg-background border border-red-600/30 rounded-lg transition-colors hover:bg-red-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-60 disabled:cursor-not-allowed",
};

export const iconButtonClass =
  "w-9 h-9 flex shrink-0 items-center justify-center text-muted bg-background border border-border rounded-lg transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed";

export const inputClass =
  "w-full min-w-0 h-11 px-4 text-sm text-foreground bg-background rounded-lg ring-1 ring-border outline-none placeholder:text-muted focus:ring-2 focus:ring-accent aria-invalid:ring-red-600 disabled:opacity-60";

export const titleInputClass =
  "w-full min-w-0 h-14 px-4 font-serif text-xl text-foreground bg-background rounded-lg ring-1 ring-border outline-none placeholder:text-muted focus:ring-2 focus:ring-accent aria-invalid:ring-red-600";

export const textareaClass =
  "w-full min-w-0 min-h-28 px-4 py-3 text-sm leading-6 text-foreground bg-background rounded-lg ring-1 ring-border outline-none resize-y placeholder:text-muted focus:ring-2 focus:ring-accent aria-invalid:ring-red-600 disabled:opacity-60";

export const selectClass =
  "w-full min-w-0 h-11 px-3 text-sm text-foreground bg-background rounded-lg ring-1 ring-border outline-none focus:ring-2 focus:ring-accent aria-invalid:ring-red-600 disabled:opacity-60";

export const cardClass =
  "w-full p-5 sm:p-6 flex flex-col gap-5 bg-surface border border-border rounded-xl";
