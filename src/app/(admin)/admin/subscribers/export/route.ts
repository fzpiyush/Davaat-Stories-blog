import { NextResponse, type NextRequest } from "next/server";

import { parseChoice } from "@/lib/admin/params";
import { requireAdmin } from "@/lib/auth/session";
import {
  listSubscribersForExport,
  SUBSCRIBER_FILTERS,
} from "@/lib/db/subscribers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = ["email", "status", "subscribed_at", "unsubscribed_at"];

/*
 * Wraps every cell in quotes, and stops spreadsheet apps from
 * treating a value that starts with = + - or @ as a formula.
 */
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  await requireAdmin();

  const filter = parseChoice(
    request.nextUrl.searchParams.get("filter"),
    SUBSCRIBER_FILTERS,
    "all",
  );
  const rows = await listSubscribersForExport(filter);

  const lines = [
    HEADERS.map(csvCell).join(","),
    ...rows.map((row) =>
      [
        row.email,
        row.status,
        row.subscribed_at.toISOString(),
        row.unsubscribed_at?.toISOString() ?? "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${filter}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
