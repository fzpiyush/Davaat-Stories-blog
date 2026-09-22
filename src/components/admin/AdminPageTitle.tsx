"use client";

import { usePathname } from "next/navigation";

import { getAdminPageTitle } from "@/lib/admin/navigation";

export default function AdminPageTitle() {
  const pathname = usePathname();

  return (
    <p className="text-lg font-semibold text-foreground">
      {getAdminPageTitle(pathname)}
    </p>
  );
}
