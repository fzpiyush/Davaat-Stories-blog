import AdminPageTitle from "@/components/admin/AdminPageTitle";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 w-full h-16 flex items-center justify-between px-6 bg-background border-b border-border">
      <AdminPageTitle />

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}