"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, ShoppingBag, Plus, Minus, Home, UtensilsCrossed,
  Copy, CheckCircle2, CheckCircle, Clock, Search, Download, Upload, ImageIcon, MessageSquare, Send, X, Receipt, CircleUser, Camera, Eye, EyeOff, MapPin, Lock, ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useCustomerStore } from "@/stores/customer-store";
import { BRANDS } from "@/types/brand";
import type { Brand, BrandSlug } from "@/types/brand";
import type { MenuItem } from "@/types/menu";
import { formatRupiah } from "@/lib/utils";
import { orderFormSchema } from "@/lib/validations/order";

type View = "auth" | "beranda" | "menu" | "history" | "chat" | "keranjang" | "checkout" | "payment" | "success" | "profil";
type CheckoutFormData = z.infer<typeof orderFormSchema>;

type OrderHistory = {
  id: string;
  orderCode: string | null;
  brandSlug: string;
  customerName: string;
  customerPhone: string;
  customerNote: string | null;
  status: string;
  paymentMethod: string;
  deliveryType: string;
  deliveryAddress: string | null;
  totalAmount: number;
  createdAt: string;
};

type OrderItem = {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

const TABS: Array<{ tab: Extract<View, "beranda" | "menu" | "history" | "chat" | "profil">; Icon: typeof Home; label: string }> = [
  { tab: "beranda", Icon: Home, label: "Beranda" },
  { tab: "menu", Icon: UtensilsCrossed, label: "Menu" },
  { tab: "history", Icon: Clock, label: "History" },
  { tab: "chat", Icon: MessageSquare, label: "Chat" },
  { tab: "profil", Icon: CircleUser, label: "Profil" },
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
  const { customer, setCustomer, clearCustomer } = useCustomerStore();
  const [view, setView] = useState<View>("beranda");
  const [selectedBrand, setSelectedBrand] = useState<BrandSlug | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [receiptItems, setReceiptItems] = useState<Array<{ name: string; qty: number; price: number }>>([]);
  const [receiptName, setReceiptName] = useState("");
  const [copied, setCopied] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [historyPhone, setHistoryPhone] = useState("");
  const [historyOrders, setHistoryOrders] = useState<OrderHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearched, setHistorySearched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(OrderHistory & { items: OrderItem[] }) | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [lastOrderPhone, setLastOrderPhone] = useState<string | null>(null);

  // Profile state
  const [profileSection, setProfileSection] = useState<"main" | "name" | "address" | "password">("main");
  const [profileName, setProfileName] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCurrentPw, setProfileCurrentPw] = useState("");
  const [profileNewPw, setProfileNewPw] = useState("");
  const [profileConfirmPw, setProfileConfirmPw] = useState("");
  const [profileShowPw, setProfileShowPw] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  // Auth form state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authPhone, setAuthPhone] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!customer && view !== "auth") setView("auth");
  }, [customer, view]);

  // Sync profile avatar from customer session
  useEffect(() => {
    if (view === "profil" && customer) {
      setProfileAvatar(customer.avatar ?? null);
      setProfileSection("main");
      setProfileMsg(null);
    }
  }, [view, customer]);

  // Chat state
  const [chatSessionId, setChatSessionId] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; message: string; createdAt: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

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
    reset,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: customer?.name ?? "",
      customerPhone: customer?.phone?.startsWith("0") ? "+62" + customer.phone.slice(1) : (customer?.phone ?? ""),
      paymentMethod: "qris",
      deliveryType: "pickup",
    },
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

  // Auto-fill checkout form dari biodata akun
  useEffect(() => {
    if (view === "checkout" && customer) {
      const phone = customer.phone.startsWith("0")
        ? "+62" + customer.phone.slice(1)
        : customer.phone;
      reset((prev) => ({ ...prev, customerName: customer.name, customerPhone: phone }));
    }
  }, [view, customer, reset]);

  // Auto-load history when navigating there (by customerId if logged in, else by phone)
  useEffect(() => {
    if (view === "history" && !historySearched) {
      if (customer) {
        setHistoryLoading(true);
        fetch(`/api/orders?customerId=${encodeURIComponent(customer.id)}`)
          .then((r) => r.json())
          .then((data) => { setHistoryOrders(data); setHistorySearched(true); })
          .catch(() => setHistorySearched(true))
          .finally(() => setHistoryLoading(false));
      } else if (lastOrderPhone) {
        setHistoryPhone(lastOrderPhone);
        setHistoryLoading(true);
        fetch(`/api/orders?phone=${encodeURIComponent(lastOrderPhone)}`)
          .then((r) => r.json())
          .then((data) => { setHistoryOrders(data); setHistorySearched(true); })
          .catch(() => setHistorySearched(true))
          .finally(() => setHistoryLoading(false));
      }
    }
  }, [view, lastOrderPhone, historySearched, customer]);

  // Init chat session from localStorage
  useEffect(() => {
    if (view === "chat" && !chatSessionId) {
      const stored = localStorage.getItem("bwaji_chat_sid");
      if (stored) {
        setChatSessionId(stored);
      } else {
        const id = crypto.randomUUID();
        localStorage.setItem("bwaji_chat_sid", id);
        setChatSessionId(id);
      }
    }
  }, [view, chatSessionId]);

  const fetchChatMessages = useCallback(async () => {
    if (!chatSessionId || !selectedBrand) return;
    const res = await fetch(`/api/chat?phone=${encodeURIComponent(chatSessionId)}&brand=${selectedBrand}`);
    if (res.ok) setChatMessages(await res.json());
  }, [chatSessionId, selectedBrand]);

  // Poll chat messages when in chat view
  useEffect(() => {
    if (view !== "chat" || !chatSessionId) return;
    fetchChatMessages();
    const t = setInterval(fetchChatMessages, 3000);
    return () => clearInterval(t);
  }, [view, chatSessionId, fetchChatMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const getQty = (id: string) => items.find((i) => i.menuItem.id === id)?.quantity ?? 0;

  // ── Auth gate (login / register) ─────────────────────────────────────────
  if (view === "auth" || !customer) {
    return (
      <div className="flex h-full flex-col bg-[#FFFCF8]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-[#FAF3EB]">
            <ArrowLeft size={19} />
          </Link>
          <span className="text-sm font-medium text-[#7A6955]">Kembali ke Home</span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="mb-8 pt-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Akun</span>
            <h1 className="mt-2 text-3xl font-black leading-tight text-[#1A0F0A]" style={{ fontFamily: "var(--font-archivo)" }}>
              {authMode === "login" ? "Masuk ke\nakun kamu" : "Daftar\nakun baru"}
            </h1>
            <p className="mt-2 text-sm text-[#7A6955]">
              {authMode === "login" ? "Biar kamu bisa tracking pesanan kapan saja." : "Gratis, cukup nomor HP & password."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/20"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nomor HP</label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={authPhone}
                onChange={(e) => setAuthPhone(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/20"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Password</label>
              <input
                type="password"
                placeholder={authMode === "register" ? "Minimal 6 karakter" : "Password kamu"}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/20"
                required
              />
            </div>

            {authError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{authError}</div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-2xl py-4 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: "#E85D04" }}
            >
              {authLoading ? "Memproses..." : authMode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <button
              onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}
              className="font-semibold text-[#E85D04]"
            >
              {authMode === "login" ? "Daftar sekarang" : "Masuk di sini"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Brand picker screen (shown first, before main app) ──
  if (!selectedBrand) {
    return (
      <div className="flex h-full flex-col bg-[#FFFCF8]">
        <div className="flex items-center gap-3 px-5 pb-4 pt-5">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-[#FAF3EB]">
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
            Halo, {customer.name.split(" ")[0]}!<br />Mau pesan apa?
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
    if (data.deliveryType === "delivery" && (!data.deliveryAddress || data.deliveryAddress.trim().length < 10)) {
      setError("deliveryAddress", { message: "Alamat pengiriman wajib diisi (minimal 10 karakter)" });
      return;
    }

    const hasDummyItems = items.some((i) => !UUID_RE.test(i.menuItem.id));
    if (hasDummyItems) {
      clearCart();
      setView("menu");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        brandSlug: selectedBrand,
        customerId: customer?.id ?? undefined,
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
        if (res.status === 500) {
          alert("Server sedang tidak bisa dihubungi. Database mungkin sedang tidak aktif — coba beberapa menit lagi.");
        } else {
          alert(`Gagal membuat pesanan (${res.status}). Coba refresh halaman dan pesan ulang.`);
        }
        return;
      }

      const order = await res.json();
      const amount = getTotalPrice();
      // Save receipt data before clearing cart
      setReceiptItems(items.map((i) => ({ name: i.menuItem.name, qty: i.quantity, price: i.menuItem.price })));
      setReceiptName(data.customerName);
      setOrderCode(order.orderCode ?? null);
      clearCart();
      setLastOrderPhone(data.customerPhone);
      if (data.paymentMethod === "qris") {
        setOrderId(order.id ?? null);
        setTotalAmount(amount);
        setProofPreview(null);
        setProofUploaded(false);
        setView("payment");
      } else {
        setTotalAmount(amount);
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

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !orderId) return;
    setProofUploading(true);
    try {
      const compressed = await compressImage(file);
      setProofPreview(compressed);
      const res = await fetch(`/api/orders/${orderId}/proof`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProof: compressed }),
      });
      if (res.ok) setProofUploaded(true);
      else alert("Gagal mengunggah bukti. Coba lagi.");
    } catch {
      alert("Gagal memproses gambar. Pastikan file adalah gambar yang valid.");
    } finally {
      setProofUploading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: authMode, phone: authPhone, password: authPassword, name: authName }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error ?? "Terjadi kesalahan"); return; }
      setCustomer({ id: data.id, name: data.name, phone: data.phone, address: data.address ?? "", avatar: data.avatar ?? null });
      setView("beranda");
      setAuthPhone(""); setAuthPassword(""); setAuthName(""); setAuthError("");
    } catch {
      setAuthError("Tidak bisa terhubung ke server.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const max = 400;
      let { width, height } = img;
      if (width > max || height > max) {
        if (width > height) { height = Math.round(height * max / width); width = max; }
        else { width = Math.round(width * max / height); height = max; }
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      const b64 = canvas.toDataURL("image/jpeg", 0.8);
      setProfileAvatar(b64);
      // Auto-save avatar
      if (!customer) return;
      const res = await fetch("/api/customer", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: customer.id, avatar: b64 }) });
      if (res.ok) { const d = await res.json(); setCustomer({ ...customer, ...d }); }
    };
    img.src = url;
  }

  async function saveProfile(field: "name" | "address" | "password") {
    if (!customer) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const body: Record<string, string> = { id: customer.id };
      if (field === "name") {
        if (profileName.trim().length < 2) { setProfileMsg({ type: "err", text: "Nama minimal 2 karakter" }); return; }
        body.name = profileName.trim();
      }
      if (field === "address") body.address = profileAddress;
      if (field === "password") {
        if (profileNewPw !== profileConfirmPw) { setProfileMsg({ type: "err", text: "Konfirmasi password tidak cocok" }); return; }
        body.currentPassword = profileCurrentPw;
        body.newPassword = profileNewPw;
      }
      const res = await fetch("/api/customer", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) { setProfileMsg({ type: "err", text: d.error ?? "Gagal menyimpan" }); return; }
      setCustomer({ ...customer, ...d });
      setProfileMsg({ type: "ok", text: "Berhasil disimpan!" });
      setProfileCurrentPw(""); setProfileNewPw(""); setProfileConfirmPw("");
      setTimeout(() => { setProfileMsg(null); setProfileSection("main"); }, 1500);
    } catch {
      setProfileMsg({ type: "err", text: "Tidak bisa terhubung ke server" });
    } finally {
      setProfileSaving(false);
    }
  }

  function printReceipt() {
    const win = window.open("", "_blank", "width=380,height=640");
    if (!win) { alert("Izinkan popup di browser untuk mencetak struk."); return; }

    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const itemRows = receiptItems
      .map(
        (i) =>
          `<tr>
            <td style="padding:3px 0">${i.name}</td>
            <td style="text-align:center;padding:3px 6px">x${i.qty}</td>
            <td style="text-align:right;padding:3px 0">${formatRupiah(i.price * i.qty)}</td>
          </tr>`
      )
      .join("");

    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Struk ${orderCode ?? ""}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:monospace;font-size:13px;max-width:300px;margin:0 auto;padding:16px;color:#111}
        .center{text-align:center}
        .brand{font-size:16px;font-weight:900;letter-spacing:1px}
        .divider{border:none;border-top:1px dashed #999;margin:10px 0}
        .code{font-size:40px;font-weight:900;letter-spacing:6px;text-align:center;margin:8px 0}
        .label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;text-align:center}
        table{width:100%;border-collapse:collapse}
        .total-row td{font-weight:900;font-size:14px;border-top:1px dashed #999;padding-top:8px;margin-top:4px}
        .footer{text-align:center;font-size:11px;color:#666;margin-top:12px}
        @media print{body{padding:0}}
      </style>
    </head><body>
      <div class="center">
        <div class="brand">BWAJI GROUP</div>
        <div style="font-size:11px;color:#555;margin-top:2px">${brand.name}</div>
      </div>
      <hr class="divider"/>
      <div class="label">Kode Pesanan</div>
      <div class="code">${orderCode ?? "—"}</div>
      <hr class="divider"/>
      <table>
        <tr><td style="color:#666;font-size:11px">Nama</td><td colspan="2" style="text-align:right">${receiptName}</td></tr>
        <tr><td style="color:#666;font-size:11px">Tanggal</td><td colspan="2" style="text-align:right;font-size:11px">${dateStr}</td></tr>
      </table>
      <hr class="divider"/>
      <table>${itemRows}
        <tr class="total-row">
          <td colspan="2">TOTAL</td>
          <td style="text-align:right">${formatRupiah(totalAmount)}</td>
        </tr>
      </table>
      <div class="footer" style="margin-top:16px">
        Tunjukkan kode pesanan saat mengambil.<br/>
        Terima kasih sudah memesan! 🙏
      </div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`);
    win.document.close();
  }

  async function openOrderDetail(order: OrderHistory) {
    setOrderDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      const data = await res.json();
      setSelectedOrder({ ...order, items: data.items ?? [] });
    } catch {
      setSelectedOrder({ ...order, items: [] });
    } finally {
      setOrderDetailLoading(false);
    }
  }

  async function searchHistory() {
    setHistoryLoading(true);
    setHistorySearched(false);
    try {
      const url = customer
        ? `/api/orders?customerId=${encodeURIComponent(customer.id)}`
        : historyPhone.trim()
          ? `/api/orders?phone=${encodeURIComponent(historyPhone.trim())}`
          : null;
      if (!url) return;
      const res = await fetch(url);
      setHistoryOrders(await res.json());
    } finally {
      setHistoryLoading(false);
      setHistorySearched(true);
    }
  }

  async function sendChatMessage(msg?: string) {
    const text = (msg ?? chatInput).trim();
    if (!text || !selectedBrand || chatSending || !chatSessionId) return;
    setChatSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: chatSessionId,
          brand: selectedBrand,
          sender: "customer",
          senderName: lastOrderPhone || "Pelanggan",
          message: text,
        }),
      });
      if (!msg) setChatInput("");
      await fetchChatMessages();
    } finally {
      setChatSending(false);
    }
  }

  async function openOrderPicker() {
    setShowOrderPicker((v) => !v);
    if (!historyOrders.length && lastOrderPhone) {
      try {
        const res = await fetch(`/api/orders?phone=${encodeURIComponent(lastOrderPhone)}`);
        if (res.ok) setHistoryOrders(await res.json());
      } catch { /* ignore */ }
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
            <span className="text-sm font-bold text-[#1A0F0A]" style={{ fontFamily: "var(--font-archivo)" }}>{brand.name}</span>
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
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className={view === "chat" ? "flex flex-1 flex-col overflow-hidden min-h-0" : "flex-1 overflow-y-auto"}>

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
                    {availableItems.length === 0 && !loading && (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <span className="text-3xl">🔧</span>
                        <p className="text-sm font-medium text-gray-500">Menu sedang disiapkan</p>
                        <p className="text-xs text-gray-400">Coba lagi beberapa saat</p>
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
                <span className="text-4xl">🔧</span>
                <p className="text-sm font-medium text-gray-500">Menu sedang disiapkan</p>
                <p className="text-xs text-gray-400">Coba lagi beberapa saat</p>
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
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-[#1A0F0A]">Riwayat Pesanan</h2>
              <button
                onClick={searchHistory}
                disabled={historyLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-50"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {historyLoading
                  ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  : <Search size={15} />}
              </button>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              Pesanan akun <span className="font-semibold text-gray-600">{customer.name}</span>
            </p>

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
                        <button
                          key={order.id}
                          onClick={() => openOrderDetail(order)}
                          className="w-full rounded-2xl bg-white p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-gray-400">{brandName}</p>
                              <p className="text-sm font-bold text-[#1A0F0A]">{order.customerName}</p>
                            </div>
                            <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: s.color, backgroundColor: s.bg }}>
                              {s.label}
                            </span>
                          </div>
                          {order.orderCode && (
                            <div className="mb-2 flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ backgroundColor: `${brand.primaryColor}12` }}>
                              <span className="text-xs text-gray-400">Kode</span>
                              <span className="text-base font-black tracking-widest" style={{ color: brand.primaryColor }}>{order.orderCode}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                            <p className="text-xs text-gray-400">{date}</p>
                            <p className="text-sm font-black" style={{ color: brand.primaryColor }}>{formatRupiah(order.totalAmount)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CHAT ── */}
        {view === "chat" && (
          <div className="flex flex-1 flex-col mx-4 mt-4 mb-2 min-h-0">
            {/* Chat card */}
            <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-sm overflow-hidden min-h-0">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: brand.primaryColor }}>
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A0F0A]">Admin {brand.name}</p>
                  <p className="text-[10px] text-gray-400">Biasanya membalas dalam beberapa menit</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                    <span className="text-3xl">👋</span>
                    <p className="text-sm text-gray-400">Halo! Ada yang bisa dibantu?</p>
                  </div>
                )}
                {chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                        m.sender === "customer"
                          ? "text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                      style={m.sender === "customer" ? { backgroundColor: brand.primaryColor } : {}}
                    >
                      <p className="leading-snug">{m.message}</p>
                      <p className={`text-[10px] mt-0.5 ${m.sender === "customer" ? "text-white/60" : "text-gray-400"}`}>
                        {new Date(m.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Order picker */}
              {showOrderPicker && (
                <div className="border-t border-gray-100 bg-gray-50 max-h-52 overflow-y-auto shrink-0">
                  <div className="flex items-center justify-between px-4 py-2.5 sticky top-0 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-600">Pilih pesanan</p>
                    <button onClick={() => setShowOrderPicker(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                  {historyOrders.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-gray-400">Belum ada pesanan</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {historyOrders.slice(0, 6).map((order) => (
                        <button
                          key={order.id}
                          onClick={async () => {
                            setShowOrderPicker(false);
                            const brandName = BRANDS.find(b => b.slug === order.brandSlug)?.name ?? order.brandSlug;
                            const msg = `Halo admin, saya mau tanya tentang pesanan saya:\n📦 Order #${order.id.slice(0, 8).toUpperCase()}\n🏪 ${brandName}\n💰 ${formatRupiah(order.totalAmount)}\n📋 Status: ${STATUS_LABEL[order.status]?.label ?? order.status}`;
                            await sendChatMessage(msg);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white transition-colors"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold" style={{ backgroundColor: brand.primaryColor }}>
                            <ShoppingBag size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[11px] text-gray-500">{BRANDS.find(b => b.slug === order.brandSlug)?.name ?? order.brandSlug} · {formatRupiah(order.totalAmount)}</p>
                          </div>
                          <span
                            className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: STATUS_LABEL[order.status]?.bg ?? "#f3f4f6", color: STATUS_LABEL[order.status]?.color ?? "#374151" }}
                          >
                            {STATUS_LABEL[order.status]?.label ?? order.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={openOrderPicker}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    title="Lampirkan pesanan"
                  >
                    <Plus size={18} />
                  </button>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                    placeholder="Ketik pesan..."
                    className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                  />
                  <button
                    onClick={() => sendChatMessage()}
                    disabled={!chatInput.trim() || chatSending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40 transition-opacity"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
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

            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5 gap-4">
              {/* Nominal */}
              <div className="w-full rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">Transfer tepat sebesar</p>
                <p className="mt-1 text-4xl font-black" style={{ color: brand.primaryColor }}>{formatRupiah(totalAmount)}</p>
                <button onClick={copyAmount} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-600">
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  {copied ? "Disalin!" : "Salin nominal"}
                </button>
              </div>

              {/* QR Code + Download */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-52 w-52 overflow-hidden rounded-2xl border-2 border-gray-200">
                  <Image src="/qris.svg" alt="QRIS Bwaji Group" fill className="object-contain p-2" />
                </div>
                <a
                  href="/qris.svg"
                  download="qris-bwaji-group.svg"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                >
                  <Download size={15} />
                  Unduh QR Code
                </a>
              </div>

              <p className="text-center text-xs text-gray-400">
                Pastikan nominal yang kamu transfer <span className="font-semibold text-gray-600">sama persis</span> agar pesanan langsung diproses.
              </p>

              {/* Upload Bukti */}
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-[#1A0F0A]">Upload Bukti Pembayaran</p>

                {proofPreview ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofPreview} alt="Bukti pembayaran" className="w-full rounded-xl object-cover max-h-48" />
                    {proofUploaded ? (
                      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-green-700">Bukti berhasil dikirim!</p>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-gray-400">Mengunggah...</p>
                    )}
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-xs font-medium text-gray-500 hover:bg-gray-50">
                      <ImageIcon size={13} />
                      Ganti foto
                      <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
                    </label>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-3 py-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                      {proofUploading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200" style={{ borderTopColor: brand.primaryColor }} />
                      ) : (
                        <Upload size={22} className="text-gray-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">
                        {proofUploading ? "Memproses..." : "Pilih screenshot pembayaran"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">JPG, PNG, atau HEIC</p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} disabled={proofUploading} />
                  </label>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <button
                onClick={() => setView("success")}
                className="w-full rounded-2xl py-4 text-sm font-bold text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {proofUploaded ? "Selesai ✓" : "Saya Sudah Bayar →"}
              </button>
            </div>
          </div>
        )}

        {/* ── SUCCESS + INVOICE ── */}
        {view === "success" && (
          <div className="flex h-full flex-col bg-gray-50">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
                <CheckCircle size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A0F0A]">Pesanan Berhasil!</p>
                <p className="text-xs text-gray-400">Screenshot sebagai bukti pengambilan</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Invoice Card */}
              <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* Brand header */}
                <div className="px-4 py-3 text-center text-white" style={{ backgroundColor: brand.primaryColor }}>
                  <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Bwaji Group</p>
                  <p className="mt-0.5 text-base font-black">{brand.name}</p>
                </div>

                {/* Order code — besar dan jelas */}
                <div className="border-b border-dashed border-gray-200 px-4 py-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Kode Pesanan</p>
                  <p
                    className="mt-1 text-5xl font-black tracking-widest"
                    style={{ color: brand.primaryColor, fontFamily: "var(--font-archivo)" }}
                  >
                    {orderCode ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Tunjukkan kode ini saat mengambil pesanan</p>
                </div>

                {/* Customer info */}
                <div className="border-b border-dashed border-gray-200 px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Nama</span>
                    <span className="font-semibold text-gray-800">{receiptName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tanggal</span>
                    <span className="font-medium text-gray-700">
                      {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-b border-dashed border-gray-200 px-4 py-3 space-y-2">
                  {receiptItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
                      <span className="font-medium text-gray-800">{formatRupiah(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-black" style={{ color: brand.primaryColor }}>{formatRupiah(totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={printReceipt}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <Receipt size={16} />
                Cetak Struk
              </button>
              <button
                onClick={() => { setHistorySearched(false); setView("history"); }}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600"
              >
                Lihat Status Pesananku
              </button>
              <button
                onClick={() => setView("beranda")}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-600"
              >
                Pesan Lagi
              </button>
            </div>
          </div>
        )}

        {/* ── ORDER DETAIL OVERLAY ── */}
        {selectedOrder && (
          <div className="absolute inset-0 z-50 flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
              <button onClick={() => setSelectedOrder(null)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100">
                <ArrowLeft size={19} className="text-gray-600" />
              </button>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1A0F0A]">Detail Pesanan</p>
                {selectedOrder.orderCode && (
                  <p className="text-xs font-black tracking-widest" style={{ color: brand.primaryColor }}>
                    {selectedOrder.orderCode}
                  </p>
                )}
              </div>
              {(() => {
                const s = STATUS_LABEL[selectedOrder.status] ?? { label: selectedOrder.status, color: "#6b7280", bg: "#f3f4f6" };
                return (
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: s.color, backgroundColor: s.bg }}>
                    {s.label}
                  </span>
                );
              })()}
            </div>

            {orderDetailLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {/* Info */}
                <div className="rounded-2xl bg-gray-50 p-4 space-y-2">
                  {[
                    { label: "Nama", value: selectedOrder.customerName },
                    { label: "Pembayaran", value: selectedOrder.paymentMethod.toUpperCase() },
                    { label: "Pengiriman", value: selectedOrder.deliveryType === "pickup" ? "Ambil di tempat" : "Delivery" },
                    ...(selectedOrder.deliveryAddress ? [{ label: "Alamat", value: selectedOrder.deliveryAddress }] : []),
                    ...(selectedOrder.customerNote ? [{ label: "Catatan", value: selectedOrder.customerNote }] : []),
                    { label: "Tanggal", value: new Date(selectedOrder.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-gray-400 shrink-0">{label}</span>
                      <span className="text-xs font-medium text-gray-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Items */}
                <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">Item Pesanan</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium text-gray-900">{item.menuItemName}</p>
                          <p className="text-xs text-gray-400">{formatRupiah(item.unitPrice)} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 shrink-0">{formatRupiah(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <span className="text-base font-black" style={{ color: brand.primaryColor }}>{formatRupiah(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PROFIL ── */}
        {view === "profil" && (
          <div className="flex-1 overflow-y-auto">
            {/* Header profil */}
            <div className="px-4 pt-5 pb-4">
              {profileSection !== "main" ? (
                <button onClick={() => { setProfileSection("main"); setProfileMsg(null); }} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500">
                  <ArrowLeft size={16} /> Kembali
                </button>
              ) : null}

              {/* Avatar + nama */}
              {profileSection === "main" && (
                <div className="flex flex-col items-center pb-6">
                  <div className="relative mb-3">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-100 ring-4 ring-white shadow-md">
                      {profileAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileAvatar} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: `${brand.primaryColor}20` }}>
                          <CircleUser size={44} style={{ color: brand.primaryColor }} />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white shadow-md" style={{ backgroundColor: brand.primaryColor }}>
                      <Camera size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                    </label>
                  </div>
                  <p className="text-lg font-black text-[#1A0F0A]">{customer?.name}</p>
                  <p className="text-sm text-gray-400">{customer?.phone}</p>
                </div>
              )}
            </div>

            {/* ── MAIN MENU ── */}
            {profileSection === "main" && (
              <div className="px-4 space-y-2 pb-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Informasi Akun</p>

                <button onClick={() => { setProfileName(customer?.name ?? ""); setProfileSection("name"); setProfileMsg(null); }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${brand.primaryColor}15` }}>
                      <CircleUser size={18} style={{ color: brand.primaryColor }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Nama</p>
                      <p className="text-sm font-semibold text-gray-800">{customer?.name}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>

                <button onClick={() => { setProfileAddress(customer?.address ?? ""); setProfileSection("address"); setProfileMsg(null); }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${brand.primaryColor}15` }}>
                      <MapPin size={18} style={{ color: brand.primaryColor }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Alamat</p>
                      <p className="text-sm font-semibold text-gray-800">{customer?.address || "Belum diisi"}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>

                <button onClick={() => { setProfileSection("password"); setProfileMsg(null); }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${brand.primaryColor}15` }}>
                      <Lock size={18} style={{ color: brand.primaryColor }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">Password</p>
                      <p className="text-sm font-semibold text-gray-800">••••••••</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>

                <div className="pt-4">
                  <button
                    onClick={() => { clearCustomer(); setView("auth"); setSelectedBrand(null); }}
                    className="w-full rounded-2xl border border-red-100 bg-red-50 py-3.5 text-sm font-semibold text-red-500"
                  >
                    Keluar dari Akun
                  </button>
                </div>
              </div>
            )}

            {/* ── EDIT NAMA ── */}
            {profileSection === "name" && (
              <div className="px-4 pb-8">
                <p className="mb-4 text-sm text-gray-500">Ubah nama yang tampil di pesanan kamu.</p>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Nama Lengkap</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
                {profileMsg && (
                  <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${profileMsg.type === "ok" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {profileMsg.text}
                  </div>
                )}
                <button
                  onClick={() => saveProfile("name")}
                  disabled={profileSaving}
                  className="mt-4 w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {profileSaving ? "Menyimpan..." : "Simpan Nama"}
                </button>
              </div>
            )}

            {/* ── EDIT ALAMAT ── */}
            {profileSection === "address" && (
              <div className="px-4 pb-8">
                <p className="mb-4 text-sm text-gray-500">Alamat untuk pengiriman order kamu.</p>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">Alamat Lengkap</label>
                <textarea
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  rows={4}
                  placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none"
                />
                {profileMsg && (
                  <div className={`mt-3 rounded-xl px-4 py-3 text-sm ${profileMsg.type === "ok" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {profileMsg.text}
                  </div>
                )}
                <button
                  onClick={() => saveProfile("address")}
                  disabled={profileSaving}
                  className="mt-4 w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {profileSaving ? "Menyimpan..." : "Simpan Alamat"}
                </button>
              </div>
            )}

            {/* ── GANTI PASSWORD ── */}
            {profileSection === "password" && (
              <div className="px-4 pb-8 space-y-4">
                <p className="text-sm text-gray-500">Masukkan password lama lalu buat password baru.</p>
                {[
                  { label: "Password Lama", val: profileCurrentPw, set: setProfileCurrentPw },
                  { label: "Password Baru", val: profileNewPw, set: setProfileNewPw },
                  { label: "Konfirmasi Password Baru", val: profileConfirmPw, set: setProfileConfirmPw },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
                    <div className="relative">
                      <input
                        type={profileShowPw ? "text" : "password"}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pr-11 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                      />
                      <button type="button" onClick={() => setProfileShowPw(!profileShowPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {profileShowPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                {profileMsg && (
                  <div className={`rounded-xl px-4 py-3 text-sm ${profileMsg.type === "ok" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {profileMsg.text}
                  </div>
                )}
                <button
                  onClick={() => saveProfile("password")}
                  disabled={profileSaving}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {profileSaving ? "Menyimpan..." : "Ganti Password"}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV (hanya untuk beranda/menu/keranjang) ── */}
      {!isFullscreen && (
        <div className="border-t border-gray-100 bg-white">
          <div className="flex items-center justify-around px-2 py-3">
            {TABS.map(({ tab, Icon, label }) => {
              const isActive = view === tab;
              const showBadge = false;
              const handleTabClick = () => {
                if (tab === "history") setHistorySearched(false);
                setView(tab);
              };
              return (
                <button key={tab} onClick={handleTabClick} className="flex flex-col items-center gap-1">
                  <div className="relative">
                    {tab === "profil" && customer?.avatar ? (
                      <div className="h-10 w-10 overflow-hidden rounded-xl transition-all" style={isActive ? { outline: `2px solid ${brand.primaryColor}` } : {}}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customer.avatar} alt="avatar" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors" style={isActive ? { backgroundColor: `${brand.primaryColor}18` } : {}}>
                        <Icon size={21} style={{ color: isActive ? brand.primaryColor : "#9ca3af" }} />
                      </div>
                    )}
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
