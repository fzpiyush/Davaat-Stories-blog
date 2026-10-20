/*
 * Gold buttons that sit inside a card. The after rule stretches the link
 * over the whole card, so the button and the card are one click target.
 * The card needs to be relative for this to work.
 */
export const cardButtonClass =
  "px-3.5 py-2 inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-accent-foreground bg-accent rounded-lg transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none after:absolute after:inset-0 after:content-['']";

export const cardButtonLargeClass =
  "px-4 py-2.5 inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent-foreground bg-accent rounded-lg transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none after:absolute after:inset-0 after:content-['']";
