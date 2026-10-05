const FALLBACK_PATH = "/";

/*
 * Only paths on this site are allowed, so a crafted login
 * link can never bounce someone to another website.
 */
export function sanitizeNextPath(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return FALLBACK_PATH;
  }

  return value;
}

export function isAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}
