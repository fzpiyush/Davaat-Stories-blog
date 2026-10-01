import AdminSidebarContent from "@/components/admin/AdminSidebarContent";

export default function AdminSidebar() {
  return (
    <aside className="w-64 xl:w-72 h-dvh p-4 hidden lg:flex shrink-0 flex-col gap-8 bg-surface border-r border-border sticky top-0 overflow-y-auto">
      <AdminSidebarContent />
    </aside>
  );
}
