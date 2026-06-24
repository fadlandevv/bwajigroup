import type { Metadata } from "next";
import { db } from "@/lib/db";
import { storeSettings, brandSettings, DEFAULT_OPENING_HOURS } from "@/lib/db/schema";
import type { OpeningHours } from "@/lib/db/schema";
import { StoreInfoForm, BrandForm, OpeningHoursForm, ChangePasswordForm } from "@/components/admin/profile-forms";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { Store, Tag, Clock, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Profil & Pengaturan" };

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-orange-500" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default async function ProfilePage() {
  let storeInfo = {
    storeName: "Bwaji Group",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
  };
  let openingHours: OpeningHours = DEFAULT_OPENING_HOURS;

  let dapurBwaji = { displayName: "Dapur Bwaji", description: "", phone: "", address: "", isActive: true };
  let hokiDimsum = { displayName: "Hoki Dimsum", description: "", phone: "", address: "", isActive: true };

  try {
    const [store] = await db.select().from(storeSettings).limit(1);
    if (store) {
      storeInfo = {
        storeName: store.storeName,
        storeAddress: store.storeAddress,
        storePhone: store.storePhone,
        storeEmail: store.storeEmail,
      };
      try { openingHours = JSON.parse(store.openingHours) as OpeningHours; } catch { /* use default */ }
    }

    const brands = await db.select().from(brandSettings);
    const dapur = brands.find((b) => b.brandSlug === "dapur-bwaji");
    const hoki = brands.find((b) => b.brandSlug === "hoki-dimsum");
    if (dapur) dapurBwaji = { displayName: dapur.displayName, description: dapur.description, phone: dapur.phone, address: dapur.address, isActive: dapur.isActive };
    if (hoki) hokiDimsum = { displayName: hoki.displayName, description: hoki.description, phone: hoki.phone, address: hoki.address, isActive: hoki.isActive };
  } catch {
    // DB not connected
  }

  return (
    <>
      <PageHeader
        title="Profil & Pengaturan"
        description="Kelola info toko, brand, dan akun admin"
      />
      <PageContent className="space-y-5">
      <Section icon={Store} title="Info Toko">
        <StoreInfoForm initial={storeInfo} />
      </Section>

      <Section icon={Clock} title="Jadwal Buka Toko">
        <OpeningHoursForm initial={openingHours} />
      </Section>

      <Section icon={Tag} title="Brand: Dapur Bwaji">
        <BrandForm brandSlug="dapur-bwaji" initial={dapurBwaji} />
      </Section>

      <Section icon={Tag} title="Brand: Hoki Dimsum">
        <BrandForm brandSlug="hoki-dimsum" initial={hokiDimsum} />
      </Section>

      <Section icon={Lock} title="Ganti Password">
        <ChangePasswordForm />
      </Section>
      </PageContent>
    </>
  );
}
