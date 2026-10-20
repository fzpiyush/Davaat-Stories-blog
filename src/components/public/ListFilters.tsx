import Link from "next/link";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";

import { buttonClass, inputClass, selectClass } from "@/lib/admin/ui";
import type { FilterOption } from "@/lib/content/filters";

export type FilterSelect = {
  name: string;
  label: string;
  allLabel: string;
  value: string;
  options: FilterOption[];
};

interface ListFiltersProps {
  id: string;
  action: string;
  query: string;
  searchLabel: string;
  placeholder: string;
  selects: FilterSelect[];
}

export default function ListFilters({
  id,
  action,
  query,
  searchLabel,
  placeholder,
  selects,
}: ListFiltersProps) {
  const hasFilters = Boolean(query) || selects.some((select) => select.value);

  return (
    <form
      role="search"
      action={action}
      className="w-full flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
    >
      <div className="min-w-0 flex-1 sm:min-w-64">
        <label htmlFor={`${id}-q`} className="sr-only">
          {searchLabel}
        </label>

        <input
          id={`${id}-q`}
          name="q"
          type="search"
          defaultValue={query}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>

      {selects.map((select) => {
        const selectId = `${id}-${select.name}`;

        return (
          <div key={select.name} className="w-full sm:w-44">
            <label htmlFor={selectId} className="sr-only">
              {select.label}
            </label>

            <select
              id={selectId}
              name={select.name}
              defaultValue={select.value}
              className={selectClass}
            >
              <option value="">{select.allLabel}</option>
              {select.options.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <button type="submit" className={buttonClass.primary}>
          <MagnifyingGlassIcon aria-hidden="true" className="w-4 h-4" />
          Search
        </button>

        {hasFilters && (
          <Link href={action} className={buttonClass.secondary}>
            <XMarkIcon aria-hidden="true" className="w-4 h-4" />
            Clear
          </Link>
        )}
      </div>
    </form>
  );
}