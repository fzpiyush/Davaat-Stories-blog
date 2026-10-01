import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin",
    default: "Admin",
  },
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({
  children,
}: Readonly<AdminLayoutProps>) {
  const { user } = await requireAdmin();

  return (
    <div className="w-full min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="min-w-0 flex flex-1 flex-col">
        <AdminHeader userName={user.name ?? user.email} />

        <main className="w-full flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
