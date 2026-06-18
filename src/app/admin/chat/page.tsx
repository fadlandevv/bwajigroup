import type { Metadata } from "next";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { AdminChatPanel } from "@/components/admin/admin-chat-panel";

export const metadata: Metadata = { title: "Live Chat" };

export default function AdminChatPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PageHeader title="Live Chat" description="Chat langsung dengan pelanggan" />
      <div className="flex flex-1 flex-col min-h-0 px-4 py-4 pb-24 md:px-8 md:py-5 md:pb-6">
        <AdminChatPanel />
      </div>
    </div>
  );
}
