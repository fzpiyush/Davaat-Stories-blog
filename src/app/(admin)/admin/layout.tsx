import type { Metadata } from "next";
import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin",
    default: "Admin",
  },
  robots: { index: false, follow: false },
};

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

export default function AdminDashboardLayout({
  children,
}: Readonly<AdminDashboardLayoutProps>) {
  return (
    <div className="w-full min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="min-w-0 flex flex-1 flex-col">
        <AdminHeader />

        <main className="w-full flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
