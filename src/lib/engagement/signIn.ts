export const COMMENT_MAX_LENGTH = 2000;

/* Sends people to Google and back to exactly where they were */
export function buildSignInHref(path: string, hash = ""): string {
  return `/api/auth/google?next=${encodeURIComponent(`${path}${hash}`)}`;
}
