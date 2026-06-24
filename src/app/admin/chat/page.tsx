import type { Metadata } from "next";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { AdminChatPanel } from "@/components/admin/admin-chat-panel";

export const metadata: Metadata = { title: "Live Chat" };

export default function AdminChatPage() {
  return (
    <>
      <PageHeader title="Live Chat" description="Chat langsung dengan pelanggan" />
      {/* 73px = PageHeader, 56px = mobile nav */}
      <div className="px-4 py-4 md:px-8 md:py-5" style={{ height: "calc(100dvh - 73px - 56px)" }}>
        <AdminChatPanel />
      </div>
    </>
  );
}
