import type { FieldErrors } from "@/lib/admin/actionState";
import { parseAdminInputValue } from "@/lib/admin/datetime";
import type { ContentStatus } from "@/lib/db/types";
import { slugify } from "@/lib/utils/slugify";
import { slugSchema } from "@/lib/validation/shared";

export type RuleResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldErrors };

// Picking the current minute shouldn't count as the future
const PUBLISH_TOLERANCE_MS = 2 * 60 * 1000;

function fail<T>(field: string, message: string): RuleResult<T> {
  return { ok: false, errors: { [field]: [message] } };
}

export function resolveSlug(
  input: string,
  fallbackText: string,
): RuleResult<string> {
  const source = input || slugify(fallbackText);

  if (!source) {
    return fail(
      "slug",
      "The title has no English letters, so add a slug like my-first-post",
    );
  }

  const parsed = slugSchema.safeParse(source);

  return parsed.success
    ? { ok: true, value: parsed.data }
    : {
        ok: false,
        errors: { slug: parsed.error.issues.map((issue) => issue.message) },
      };
}

export function resolvePublishDate(
  status: ContentStatus,
  publishAt: string,
  now: Date = new Date(),
): RuleResult<Date | null> {
  const entered = publishAt ? parseAdminInputValue(publishAt) : null;

  if (publishAt && !entered) {
    return fail("publishAt", "Pick a valid date and time");
  }

  if (status === "scheduled") {
    if (!entered) {
      return fail("publishAt", "Pick when it should go live");
    }

    if (entered.getTime() <= now.getTime()) {
      return fail(
        "publishAt",
        "Pick a time in the future, or choose Published",
      );
    }

    return { ok: true, value: entered };
  }

  if (status === "published") {
    if (entered && entered.getTime() > now.getTime() + PUBLISH_TOLERANCE_MS) {
      return fail(
        "publishAt",
        "That time is in the future, so choose Scheduled instead",
      );
    }

    const publishedAt = !entered || entered > now ? now : entered;
    return { ok: true, value: publishedAt };
  }

  return { ok: true, value: entered };
}

/* Trims, removes duplicates ignoring case, and checks each tag can have a slug */
export function normalizeTagNames(names: string[]): RuleResult<string[]> {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ");
    const key = name.toLowerCase();

    if (!name || seen.has(key)) {
      continue;
    }

    if (!slugify(name)) {
      return fail(
        "tags",
        `${name} needs at least one English letter or number`,
      );
    }

    seen.add(key);
    result.push(name);
  }

  return { ok: true, value: result };
}

export function collectErrors(...results: RuleResult<unknown>[]): FieldErrors {
  return results.reduce<FieldErrors>(
    (errors, result) => (result.ok ? errors : { ...errors, ...result.errors }),
    {},
  );
}
