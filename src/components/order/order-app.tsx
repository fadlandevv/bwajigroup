"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, ShoppingBag, Plus, Minus, Home, UtensilsCrossed,
  Copy, CheckCircle2, CheckCircle, Clock, Search,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { BRANDS } from "@/types/brand";
import type { Brand, BrandSlug } from "@/types/brand";
import type { MenuItem } from "@/types/menu";
import { formatRupiah } from "@/lib/utils";
import { orderFormSchema } from "@/lib/validations/order";

type View = "beranda" | "menu" | "history" | "keranjang" | "checkout" | "payment" | "success";
type CheckoutFormData = z.infer<typeof orderFormSchema>;

type OrderHistory = {
  id: string;
  brandSlug: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
};

const TABS: Array<{ tab: Extract<View, "beranda" | "menu" | "history" | "keranjang">; Icon: typeof Home; label: string }> = [
  { tab: "beranda", Icon: Home, label: "Beranda" },
  { tab: "menu", Icon: UtensilsCrossed, label: "Menu" },
  { tab: "history", Icon: Clock, label: "History" },
  { tab: "keranjang", Icon: ShoppingBag, label: "Keranjang" },
];

interface CardProps {
  item: MenuItem;
  brand: Brand;
  qty: number;
  onAdd: () => void;
  onDec: () => void;
}

function MenuCard({ item, brand, qty, onAdd, onDec }: CardProps) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1A0F0A]">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-[#7A6955]">{item.description}</p>
        )}
        <p className="mt-1 text-sm font-bold" style={{ color: brand.primaryColor }}>
          {formatRupiah(item.price)}
        </p>
      </div>
      <div className="flex-shrink-0">
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm"
            style={{ backgroundColor: brand.primaryColor }}
          >
            <Plus size={16} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onDec}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2"
              style={{ borderColor: brand.primaryColor }}
            >
              <Minus size={11} style={{ color: brand.primaryColor }} />
            </button>
            <span className="w-4 text-center text-sm font-bold text-[#1A0F0A]">{qty}</span>
            <button
              onClick={onAdd}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Plus size={11} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedCard({ item, brand, qty, onAdd, onDec }: CardProps) {
  return (
    <div className="w-36 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="relative h-28 bg-gray-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-yellow-900">
          ⭐ Unggulan
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-[#1A0F0A]">{item.name}</p>
        <p className="mt-1 text-xs font-bold" style={{ color: brand.primaryColor }}>
          {formatRupiah(item.price)}
        </p>
        <div className="mt-2">
          {qty === 0 ? (
            <button
              onClick={onAdd}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Plus size={13} />
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <button onClick={onDec} className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: brand.primaryColor }}>
                <Minus size={10} style={{ color: brand.primaryColor }} />
              </button>
              <span className="text-xs font-bold text-[#1A0F0A]">{qty}</span>
              <button onClick={onAdd} className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: brand.primaryColor }}>
                <Plus size={10} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrderApp() {
  const [view, setView] = useState<View>("beranda");
  const [selectedBrand, setSelectedBrand] = useState<BrandSlug | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [historyPhone, setHistoryPhone] = useState("");
  const [historyOrders, setHistoryOrders] = useState<OrderHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearched, setHistorySearched] = useState(false);

  const { items, addItem, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCartStore();

  const brand = BRANDS.find((b) => b.slug === selectedBrand) ?? BRANDS[0];
  const categories = ["Semua", ...Array.from(new Set(menuItems.map((m) => m.category)))];
  const availableItems = menuItems.filter((m) => m.isAvailable);
  const featuredItems = availableItems.filter((m) => m.isFeatured);
  const filteredItems = activeCategory === "Semua" ? availableItems : availableItems.filter((m) => m.category === activeCategory);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { paymentMethod: "qris", deliveryType: "pickup" },
  });

  const paymentMethod = watch("paymentMethod");
  const deliveryType = watch("deliveryType");

  useEffect(() => {
    if (!selectedBrand) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menu?brand=${selectedBrand}`);
        setMenuItems(await res.json());
        setActiveCategory("Semua");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedBrand]);

  const getQty = (id: string) => items.find((i) => i.menuItem.id === id)?.quantity ?? 0;

  // ── Brand picker screen (shown first, before main app) ──
  if (!selectedBrand) {
    return (
      <div className="flex h-full flex-col bg-[#FFFCF8]">
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-[#FAF3EB]"
          >
            <ArrowLeft size={19} />
          </Link>
          <span className="text-sm font-medium text-[#7A6955]">Kembali ke Home</span>
        </div>

        <div className="px-5 pb-8 pt-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">
            Pemesanan
          </span>
          <h1
            className="mt-2 text-3xl font-black leading-tight text-[#1A0F0A]"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Mau pesan<br />dari mana?
          </h1>
          <p className="mt-2 text-sm text-[#7A6955]">
            Pilih brand favoritmu untuk mulai memesan
          </p>
        </div>

        <div className="flex-1 space-y-4 px-5">
          {BRANDS.map((b) => (
            <button
              key={b.slug}
              onClick={() => setSelectedBrand(b.slug)}
              className="relative w-full overflow-hidden rounded-3xl p-6 text-left text-white transition-all hover:scale-[1.01] active:scale-[0.98]"
              style={{ backgroundColor: b.primaryColor }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 90% 10%, ${b.accentColor}, transparent 50%)`,
                }}
              />
              <div className="relative">
                <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
                  Bwaji Group
                </span>
                <h2
                  className="mt-1.5 text-2xl font-black"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  {b.name}
                </h2>
                <p className="mt-1 text-sm opacity-80">{b.tagline}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold">
                  Pesan sekarang →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  async function onCheckoutSubmit(data: CheckoutFormData) {
    // Manual delivery address check (skips ZodEffects complexity)
    if (data.deliveryType === "delivery" && (!data.deliveryAddress || data.deliveryAddress.trim().length < 10)) {
      setError("deliveryAddress", { message: "Alamat pengiriman wajib diisi (minimal 10 karakter)" });
      return;
    }

    // Guard: items from public brand pages use dummy IDs (non-UUID). Detect and clear.
    const hasDummyItems = items.some((i) => !UUID_RE.test(i.menuItem.id));
    if (hasDummyItems) {
      clearCart();
      alert("Keranjang berisi item lama yang tidak valid. Keranjang sudah dikosongkan — silakan tambah menu lagi dari tab Menu.");
      setView("menu");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        brandSlug: selectedBrand,
        items: items.map((i) => ({ menuItemId: i.menuItem.id, quantity: i.quantity })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("API Error", res.status, JSON.stringify(err));
        alert(`Gagal (${res.status}): ${err?.error ? JSON.stringify(err.error) : "Server error, coba lagi."}`);
        return;
      }

      const amount = getTotalPrice();
      clearCart();
      if (data.paymentMethod === "qris") {
        setTotalAmount(amount);
        setView("payment");
      } else {
        setView("success");
      }
    } catch (err) {
      console.error("Network/submit error:", err);
      alert("Tidak bisa terhubung ke server. Periksa koneksi internet.");
    } finally {
      setSubmitting(false);
    }
  }

  function copyAmount() {
    navigator.clipboard.writeText(String(totalAmount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function searchHistory() {
    if (!historyPhone.trim()) return;
    setHistoryLoading(true);
    setHistorySearched(false);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(historyPhone.trim())}`);
      setHistoryOrders(await res.json());
    } finally {
      setHistoryLoading(false);
      setHistorySearched(true);
    }
  }

  const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
    pending:   { label: "Menunggu",   color: "#92400e", bg: "#fef3c7" },
    confirmed: { label: "Dikonfirmasi", color: "#1e40af", bg: "#dbeafe" },
    preparing: { label: "Dimasak",    color: "#c2410c", bg: "#ffedd5" },
    ready:     { label: "Siap Ambil", color: "#065f46", bg: "#d1fae5" },
    delivered: { label: "Selesai",    color: "#166534", bg: "#bbf7d0" },
    cancelled: { label: "Dibatalkan", color: "#991b1b", bg: "#fee2e2" },
  };

  const isFullscreen = view === "checkout" || view === "payment" || view === "success";

  return (
    <div className="flex h-full flex-col bg-gray-50">

      {/* ── HEADER ── */}
      {!isFullscreen && (
        <div className="z-10 bg-white px-5 pb-0 pt-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-gray-100">
              <ArrowLeft size={19} />
            </Link>
            <span className="text-sm font-bold text-[#1A0F0A]">Bwaji Group</span>
            <button
              onClick={() => setView("keranjang")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-gray-100"
            >
              <ShoppingBag size={19} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: brand.primaryColor }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          <div
            className="mb-3 rounded-xl px-3 py-2 text-center text-xs font-semibold"
            style={{ backgroundColor: `${brand.primaryColor}15`, color: brand.primaryColor }}
          >
            {brand.name}
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── BERANDA ── */}
        {view === "beranda" && (
          <div className="pb-6">
            <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl p-5" style={{ backgroundColor: brand.primaryColor }}>
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at 85% 15%, ${brand.accentColor}, transparent 55%)` }} />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Spesial Hari Ini</p>
                <h2 className="mt-1 text-2xl font-black text-white" style={{ fontFamily: "var(--font-archivo)" }}>
                  Fresh & Lezat<br />Setiap Hari! 🔥
                </h2>
                <p className="mt-1.5 text-xs text-white/75">Bahan segar, dimasak langsung untuk kamu</p>
                <button onClick={() => setView("menu")} className="mt-4 rounded-full bg-white px-4 py-1.5 text-xs font-bold" style={{ color: brand.primaryColor }}>
                  Lihat Menu →
                </button>
              </div>
            </div>
            <div className="mx-4 mt-4 grid grid-cols-4 gap-3">
              {[{ icon: "🍽️", label: "Menu" }, { icon: "⭐", label: "Favorit" }, { icon: "🔥", label: "Promo" }, { icon: "📦", label: "Paket" }].map(({ icon, label }) => (
                <button key={label} onClick={() => setView("menu")} className="flex flex-col items-center gap-1.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">{icon}</div>
                  <span className="text-[11px] font-medium text-gray-600">{label}</span>
                </button>
              ))}
            </div>
            {featuredItems.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between px-4">
                  <h3 className="font-bold text-[#1A0F0A]">Menu Unggulan ⭐</h3>
                  <button onClick={() => setView("menu")} className="text-xs font-medium" style={{ color: brand.primaryColor }}>Lihat semua</button>
                </div>
                <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: "none" }}>
                  {featuredItems.map((item) => (
                    <FeaturedCard key={item.id} item={item} brand={brand} qty={getQty(item.id)} onAdd={() => addItem(item)} onDec={() => updateQuantity(item.id, getQty(item.id) - 1)} />
                  ))}
                </div>
              </div>
            )}
            <div className="mx-4 mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-[#1A0F0A]">Semua Menu</h3>
                <button onClick={() => setView("menu")} className="text-xs font-medium" style={{ color: brand.primaryColor }}>Lihat semua</button>
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: brand.primaryColor }} />
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
                    {availableItems.slice(0, 5).map((item) => (
                      <MenuCard key={item.id} item={item} brand={brand} qty={getQty(item.id)} onAdd={() => addItem(item)} onDec={() => updateQuantity(item.id, getQty(item.id) - 1)} />
                    ))}
                    {availableItems.length === 0 && (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <span className="text-3xl">🍽️</span>
                        <p className="text-sm text-gray-400">Belum ada menu tersedia</p>
                      </div>
                    )}
                  </div>
                  {availableItems.length > 5 && (
                    <button onClick={() => setView("menu")} className="mt-3 w-full rounded-xl border py-3 text-sm font-semibold" style={{ borderColor: brand.primaryColor, color: brand.primaryColor }}>
                      + {availableItems.length - 5} menu lainnya
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {view === "menu" && (
          <div>
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
              <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className="flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                    style={activeCategory === cat ? { backgroundColor: brand.primaryColor, color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#6b7280" }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: brand.primaryColor }} />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <span className="text-4xl">🍽️</span>
                <p className="text-sm text-gray-400">Belum ada menu tersedia</p>
              </div>
            ) : (
              <div className="mx-4 my-4 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
                {filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} brand={brand} qty={getQty(item.id)} onAdd={() => addItem(item)} onDec={() => updateQuantity(item.id, getQty(item.id) - 1)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {view === "history" && (
          <div className="mx-4 mt-4 pb-6">
            <h2 className="mb-1 text-lg font-bold text-[#1A0F0A]">Riwayat Pesanan</h2>
            <p className="mb-4 text-xs text-gray-400">Masukkan nomor HP yang kamu gunakan saat pesan</p>
            <div className="flex gap-2">
              <input
                type="tel"
                value={historyPhone}
                onChange={(e) => setHistoryPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchHistory()}
                placeholder="08xxxxxxxxxx"
                className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
              />
              <button
                onClick={searchHistory}
                disabled={historyLoading || !historyPhone.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white disabled:opacity-50"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {historyLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Search size={17} />
                )}
              </button>
            </div>

            {historySearched && !historyLoading && (
              <div className="mt-4">
                {historyOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white py-16 shadow-sm">
                    <span className="text-3xl">📭</span>
                    <p className="text-sm font-medium text-gray-400">Tidak ada pesanan ditemukan</p>
                    <p className="text-xs text-gray-300">Coba nomor HP lain</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">{historyOrders.length} pesanan ditemukan</p>
                    {historyOrders.map((order) => {
                      const s = STATUS_LABEL[order.status] ?? { label: order.status, color: "#6b7280", bg: "#f3f4f6" };
                      const brandName = order.brandSlug === "dapur-bwaji" ? "Dapur Bwaji" : "Hoki Dimsum";
                      const date = new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                      });
                      return (
                        <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-400">{brandName}</p>
                              <p className="text-sm font-bold text-[#1A0F0A]">{order.customerName}</p>
                            </div>
                            <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: s.color, backgroundColor: s.bg }}>
                              {s.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                            <p className="text-xs text-gray-400">{date}</p>
                            <p className="text-sm font-black" style={{ color: brand.primaryColor }}>{formatRupiah(order.totalAmount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── KERANJANG ── */}
        {view === "keranjang" && (
          <div className="mx-4 mt-4 pb-6">
            <h2 className="mb-4 text-lg font-bold text-[#1A0F0A]">Keranjang</h2>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">🛒</div>
                <p className="text-sm font-medium text-gray-500">Keranjang masih kosong</p>
                <button onClick={() => setView("menu")} className="rounded-full px-6 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: brand.primaryColor }}>
                  Tambah Menu
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
                  {items.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="flex items-center gap-3 py-4">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {menuItem.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={menuItem.imageUrl} alt={menuItem.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">🍽️</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1A0F0A]">{menuItem.name}</p>
                        <p className="mt-0.5 text-sm font-bold" style={{ color: brand.primaryColor }}>{formatRupiah(menuItem.price)}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button onClick={() => updateQuantity(menuItem.id, quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border-2" style={{ borderColor: brand.primaryColor }}>
                          <Minus size={11} style={{ color: brand.primaryColor }} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold text-[#1A0F0A]">{quantity}</span>
                        <button onClick={() => addItem(menuItem)} className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ backgroundColor: brand.primaryColor }}>
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Subtotal ({totalItems} item)</span>
                    <span className="font-semibold text-[#1A0F0A]">{formatRupiah(totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="font-bold text-[#1A0F0A]">Total</span>
                    <span className="text-lg font-black" style={{ color: brand.primaryColor }}>{formatRupiah(totalPrice)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={clearCart} className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Kosongkan
                  </button>
                  <button onClick={() => setView("checkout")} className="flex-1 rounded-xl py-3 text-sm font-bold text-white" style={{ backgroundColor: brand.primaryColor }}>
                    Checkout • {formatRupiah(totalPrice)}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── CHECKOUT ── */}
        {view === "checkout" && (
          <div className="flex h-full flex-col bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
              <button onClick={() => setView("keranjang")} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100">
                <ArrowLeft size={18} />
              </button>
              <div>
                <p className="text-sm font-bold text-[#1A0F0A]">Data Pemesan</p>
                <p className="text-xs text-gray-400">Total: {formatRupiah(totalPrice)}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(onCheckoutSubmit, (e) => console.error("Form validation errors:", e))} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-4 px-4 py-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Nama Lengkap</label>
                  <input
                    placeholder="John Doe"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    {...register("customerName")}
                  />
                  {errors.customerName && <p className="text-xs text-red-500">{errors.customerName.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Nomor HP</label>
                  <input
                    placeholder="08xxxxxxxxxx"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    {...register("customerPhone")}
                  />
                  {errors.customerPhone && <p className="text-xs text-red-500">{errors.customerPhone.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Catatan (opsional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tidak pedas, tidak pakai bawang..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    {...register("customerNote")}
                  />
                </div>
                {/* Jenis Pengiriman */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Jenis Pengiriman</label>
                  {([
                    { value: "pickup", label: "Ambil di Tempat", desc: "Ambil langsung di lokasi kami" },
                    { value: "delivery", label: "Diantar (Delivery)", desc: "Masukkan alamat, kami atur kurirnya" },
                  ] as const).map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                      style={deliveryType === value ? { borderColor: brand.primaryColor, backgroundColor: `${brand.primaryColor}08` } : {}}
                    >
                      <input type="radio" value={value} {...register("deliveryType")} className="accent-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-[#1A0F0A]">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Alamat (hanya jika delivery) */}
                {deliveryType === "delivery" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600">Alamat Pengiriman</label>
                    <textarea
                      rows={3}
                      placeholder="Jl. Contoh No. 1, RT/RW, Kelurahan, Kecamatan, Kota..."
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{ focusBorderColor: brand.primaryColor } as React.CSSProperties}
                      {...register("deliveryAddress")}
                    />
                    {errors.deliveryAddress && (
                      <p className="text-xs text-red-500">{errors.deliveryAddress.message}</p>
                    )}
                  </div>
                )}

                {/* Metode Pembayaran */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600">Metode Pembayaran</label>
                  {(["qris", "transfer", "cash"] as const).map((method) => (
                    <label key={method} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <input type="radio" value={method} {...register("paymentMethod")} className="accent-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-[#1A0F0A]">
                          {method === "qris" ? "QRIS" : method === "transfer" ? "Transfer Bank" : "Bayar di Tempat"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {method === "qris" ? "Scan QR, bayar sesuai nominal" : method === "transfer" ? "Transfer ke rekening kami" : "Bayar langsung saat ambil"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 p-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl py-4 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {submitting ? "Memproses..." : paymentMethod === "qris" ? "Lanjut ke Pembayaran QRIS →" : "Buat Pesanan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── PAYMENT (QRIS) ── */}
        {view === "payment" && (
          <div className="flex h-full flex-col bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <span className="text-sm">💳</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A0F0A]">Scan & Bayar</p>
                <p className="text-xs text-gray-400">Langkah terakhir</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-6 py-6 gap-5">
              <div className="w-full rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">Transfer tepat sebesar</p>
                <p className="mt-1 text-4xl font-black" style={{ color: brand.primaryColor }}>{formatRupiah(totalAmount)}</p>
                <button onClick={copyAmount} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-600">
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  {copied ? "Disalin!" : "Salin nominal"}
                </button>
              </div>
              <div className="relative h-52 w-52 overflow-hidden rounded-2xl border-2 border-gray-200">
                <Image src="/qris.svg" alt="QRIS Bwaji Group" fill className="object-contain p-2" />
              </div>
              <p className="text-center text-xs text-gray-400">
                Pastikan nominal yang kamu transfer <span className="font-semibold text-gray-600">sama persis</span> agar pesanan langsung diproses.
              </p>
            </div>
            <div className="border-t border-gray-100 p-4">
              <button onClick={() => setView("success")} className="w-full rounded-2xl py-4 text-sm font-bold text-white" style={{ backgroundColor: brand.primaryColor }}>
                Saya Sudah Bayar ✓
              </button>
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {view === "success" && (
          <div className="flex h-full flex-col items-center justify-center bg-white px-6 text-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <CheckCircle size={42} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A0F0A]" style={{ fontFamily: "var(--font-archivo)" }}>Pesanan Berhasil!</h2>
              <p className="mt-1.5 text-sm text-gray-500">Pesanan kamu sudah kami terima.<br />Kami akan segera memprosesnya.</p>
            </div>
            <button
              onClick={() => { setView("beranda"); }}
              className="mt-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white"
              style={{ backgroundColor: brand.primaryColor }}
            >
              Kembali ke Beranda
            </button>
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV (hanya untuk beranda/menu/keranjang) ── */}
      {!isFullscreen && (
        <div className="border-t border-gray-100 bg-white">
          <div className="flex items-center justify-around px-8 py-3">
            {TABS.map(({ tab, Icon, label }) => {
              const isActive = view === tab;
              const showBadge = tab === "keranjang" && totalItems > 0;
              return (
                <button key={tab} onClick={() => setView(tab)} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors" style={isActive ? { backgroundColor: `${brand.primaryColor}18` } : {}}>
                      <Icon size={21} style={{ color: isActive ? brand.primaryColor : "#9ca3af" }} />
                    </div>
                    {showBadge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: brand.primaryColor }}>
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: isActive ? brand.primaryColor : "#9ca3af" }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
