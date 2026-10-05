export function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parsePage(value: string | string[] | undefined): number {
  const page = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function parseQuery(value: string | string[] | undefined): string {
  return firstParam(value).trim().slice(0, 100);
}

/* Only accepts one of the allowed values, anything else becomes the fallback */
export function parseChoice<T extends string>(
  value: string | string[] | undefined | null,
  allowed: readonly T[],
  fallback: T,
): T {
  const raw = firstParam(value ?? undefined);
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}
