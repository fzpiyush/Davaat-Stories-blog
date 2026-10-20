import { EyeIcon } from "@heroicons/react/20/solid";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

interface ViewCountProps {
  count?: number;
  /** Adds a bullet before the count, for use inside a meta row */
  separated?: boolean;
}

export default function ViewCount({
  count,
  separated = false,
}: ViewCountProps) {
  if (count === undefined) {
    return null;
  }

  return (
    <>
      {separated && <span aria-hidden="true">•</span>}

      <span className="inline-flex items-center gap-1">
        <EyeIcon aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
        {compactNumber.format(count)}
        <span className="sr-only">{count === 1 ? "view" : "views"}</span>
      </span>
    </>
  );
}
