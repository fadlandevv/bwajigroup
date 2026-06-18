import type { Metadata } from "next";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { AdminChatPanel } from "@/components/admin/admin-chat-panel";

export const metadata: Metadata = { title: "Live Chat" };

export default function AdminChatPage() {
  return (
    <>
      <PageHeader title="Live Chat" description="Chat langsung dengan pelanggan" />
      <PageContent>
        <AdminChatPanel />
      </PageContent>
    </>
  );
}
