import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
