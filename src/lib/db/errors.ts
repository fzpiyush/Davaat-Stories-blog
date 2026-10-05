type PgErrorLike = {
  code?: unknown;
  constraint?: unknown;
};

function asPgError(error: unknown): PgErrorLike | null {
  return typeof error === "object" && error !== null
    ? (error as PgErrorLike)
    : null;
}

export function isUniqueViolation(error: unknown): boolean {
  return asPgError(error)?.code === "23505";
}

export function isForeignKeyViolation(error: unknown): boolean {
  return asPgError(error)?.code === "23503";
}

export function getConstraintName(error: unknown): string {
  const constraint = asPgError(error)?.constraint;
  return typeof constraint === "string" ? constraint : "";
}