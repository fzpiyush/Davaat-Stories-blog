import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  return <main className="w-full min-h-screen">{children}</main>;
}