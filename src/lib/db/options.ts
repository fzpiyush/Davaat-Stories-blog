import "server-only";

import type { Option } from "@/lib/admin/editor";
import { db } from "@/lib/db/knex";

export async function listCategoryOptions(): Promise<Option[]> {
  const rows: { id: string; name: string }[] = await db("categories")
    .select("id", "name")
    .orderByRaw("lower(name) asc");

  return rows.map((row) => ({ id: row.id, label: row.name }));
}

export async function listTagNames(): Promise<string[]> {
  return db("tags").orderByRaw("lower(name) asc").pluck("name");
}