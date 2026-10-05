import { buttonClass, inputClass } from "@/lib/admin/ui";

interface SearchFormProps {
  id: string;
  action: string;
  query: string;
  label: string;
  placeholder: string;
  /** Keeps other filters, like status, when searching */
  hiddenParams?: Record<string, string>;
}

export default function SearchForm({
  id,
  action,
  query,
  label,
  placeholder,
  hiddenParams = {},
}: SearchFormProps) {
  return (
    <form
      role="search"
      action={action}
      className="w-full lg:max-w-sm flex gap-2"
    >
      {Object.entries(hiddenParams)
        .filter(([, value]) => value)
        .map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <input
        id={id}
        name="q"
        type="search"
        defaultValue={query}
        placeholder={placeholder}
        className={inputClass}
      />

      <button type="submit" className={buttonClass.secondary}>
        Search
      </button>
    </form>
  );
}
