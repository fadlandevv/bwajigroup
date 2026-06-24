"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OpeningHours } from "@/lib/db/schema";

// ─── Store Info Form ──────────────────────────────────────────────────────────
interface StoreInfoProps {
  initial: { storeName: string; storeAddress: string; storePhone: string; storeEmail: string };
}

export function StoreInfoForm({ initial }: StoreInfoProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setSaved(false);
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Nama Toko" value={form.storeName} onChange={update("storeName")} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Alamat</label>
        <textarea
          rows={2}
          value={form.storeAddress}
          onChange={update("storeAddress")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="No. Telepon" value={form.storePhone} onChange={update("storePhone")} />
        <Input label="Email" type="email" value={form.storeEmail} onChange={update("storeEmail")} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
        {saved && <span className="text-xs text-green-600 font-medium">Tersimpan ✓</span>}
      </div>
    </form>
  );
}

// ─── Brand Form ───────────────────────────────────────────────────────────────
interface BrandFormProps {
  brandSlug: string;
  initial: { displayName: string; description: string; phone: string; address: string; isActive: boolean };
}

export function BrandForm({ brandSlug, initial }: BrandFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setSaved(false);
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/brand/${brandSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input label="Nama Brand" value={form.displayName} onChange={update("displayName")} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={update("description")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="No. Telepon" value={form.phone} onChange={update("phone")} />
        <Input label="Alamat" value={form.address} onChange={update("address")} />
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-orange-500"
          checked={form.isActive}
          onChange={(e) => { setForm((p) => ({ ...p, isActive: e.target.checked })); setSaved(false); }}
        />
        <span className="font-medium text-gray-700">Brand aktif</span>
      </label>
      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
        {saved && <span className="text-xs text-green-600 font-medium">Tersimpan ✓</span>}
      </div>
    </form>
  );
}

// ─── Opening Hours Form ───────────────────────────────────────────────────────
const DAYS = [
  { key: "monday", label: "Senin" },
  { key: "tuesday", label: "Selasa" },
  { key: "wednesday", label: "Rabu" },
  { key: "thursday", label: "Kamis" },
  { key: "friday", label: "Jumat" },
  { key: "saturday", label: "Sabtu" },
  { key: "sunday", label: "Minggu" },
] as const;

interface OpeningHoursFormProps {
  initial: OpeningHours;
}

export function OpeningHoursForm({ initial }: OpeningHoursFormProps) {
  const router = useRouter();
  const [hours, setHours] = useState<OpeningHours>(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateDay(day: keyof OpeningHours, field: "isOpen" | "open" | "close", value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openingHours: hours }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      alert("Gagal menyimpan jadwal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="divide-y divide-gray-100">
      {DAYS.map(({ key, label }) => {
        const day = hours[key];
        return (
          <div key={key} className="py-3">
            {/* Row 1: day name + toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <label className="flex cursor-pointer items-center gap-2">
                <span className={`text-xs font-medium ${day?.isOpen ? "text-green-600" : "text-gray-400"}`}>
                  {day?.isOpen ? "Buka" : "Tutup"}
                </span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-orange-500"
                  checked={day?.isOpen ?? false}
                  onChange={(e) => updateDay(key, "isOpen", e.target.checked)}
                />
              </label>
            </div>
            {/* Row 2: time inputs */}
            <div className={`mt-2 flex items-center gap-2 transition-opacity ${day?.isOpen ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
              <input
                type="time"
                value={day?.open ?? "08:00"}
                onChange={(e) => updateDay(key, "open", e.target.value)}
                className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
              />
              <span className="text-xs text-gray-400 flex-none">–</span>
              <input
                type="time"
                value={day?.close ?? "22:00"}
                onChange={(e) => updateDay(key, "close", e.target.value)}
                className="h-9 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Jadwal"}
        </Button>
        {saved && <span className="text-xs text-green-600 font-medium">Tersimpan ✓</span>}
      </div>
    </form>
  );
}

// ─── Change Password Form ─────────────────────────────────────────────────────
export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setMessage(null);
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Password baru tidak cocok" });
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password minimal 8 karakter" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal");
      setMessage({ type: "success", text: "Password berhasil diubah" });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Gagal mengubah password" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Password Saat Ini"
        type="password"
        value={form.currentPassword}
        onChange={update("currentPassword")}
        autoComplete="current-password"
      />
      <Input
        label="Password Baru"
        type="password"
        value={form.newPassword}
        onChange={update("newPassword")}
        autoComplete="new-password"
      />
      <Input
        label="Konfirmasi Password Baru"
        type="password"
        value={form.confirmPassword}
        onChange={update("confirmPassword")}
        autoComplete="new-password"
      />
      {message && (
        <p className={`text-xs font-medium ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
          {message.text}
        </p>
      )}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Menyimpan..." : "Ubah Password"}
      </Button>
    </form>
  );
}
