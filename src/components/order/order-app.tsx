"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Plus, Minus, Home, UtensilsCrossed } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { BRANDS } from "@/types/brand";
import type { Brand, BrandSlug } from "@/types/brand";
import type { MenuItem } from "@/types/menu";
import { formatRupiah } from "@/lib/utils";

type Tab = "beranda" | "menu" | "keranjang";

const TABS: Array<{ tab: Tab; Icon: typeof Home; label: string }> = [
  { tab: "beranda", Icon: Home, label: "Beranda" },
  { tab: "menu", Icon: UtensilsCrossed, label: "Menu" },
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
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-[#1A0F0A]">
          {item.name}
        </p>
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
              <button
                onClick={onDec}
                className="flex h-6 w-6 items-center justify-center rounded-full border"
                style={{ borderColor: brand.primaryColor }}
              >
                <Minus size={10} style={{ color: brand.primaryColor }} />
              </button>
              <span className="text-xs font-bold text-[#1A0F0A]">{qty}</span>
              <button
                onClick={onAdd}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
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
  const [activeTab, setActiveTab] = useState<Tab>("beranda");
  const [selectedBrand, setSelectedBrand] = useState<BrandSlug>("dapur-bwaji");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const { items, addItem, updateQuantity, getTotalItems, getTotalPrice, clearCart } =
    useCartStore();

  const brand = BRANDS.find((b) => b.slug === selectedBrand)!;
  const categories = ["Semua", ...Array.from(new Set(menuItems.map((m) => m.category)))];
  const availableItems = menuItems.filter((m) => m.isAvailable);
  const featuredItems = availableItems.filter((m) => m.isFeatured);
  const filteredItems =
    activeCategory === "Semua"
      ? availableItems
      : availableItems.filter((m) => m.category === activeCategory);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  useEffect(() => {
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

  const getQty = (id: string) =>
    items.find((i) => i.menuItem.id === id)?.quantity ?? 0;

  return (
    <div className="flex h-full flex-col bg-gray-50">

      {/* ── HEADER ── */}
      <div className="z-10 bg-white px-5 pb-0 pt-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-gray-100"
          >
            <ArrowLeft size={19} />
          </Link>
          <span className="text-sm font-bold text-[#1A0F0A]">Bwaji Group</span>
          <button
            onClick={() => setActiveTab("keranjang")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#7A6955] hover:bg-gray-100"
          >
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Brand toggle */}
        <div className="mb-3 flex rounded-xl bg-gray-100 p-1">
          {BRANDS.map((b) => (
            <button
              key={b.slug}
              onClick={() => setSelectedBrand(b.slug)}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all duration-200"
              style={
                selectedBrand === b.slug
                  ? { backgroundColor: b.primaryColor, color: "#fff" }
                  : { color: "#9ca3af" }
              }
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── BERANDA ── */}
        {activeTab === "beranda" && (
          <div className="pb-6">

            {/* Promo banner */}
            <div
              className="relative mx-4 mt-4 overflow-hidden rounded-2xl p-5"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(circle at 85% 15%, ${brand.accentColor}, transparent 55%)`,
                }}
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Spesial Hari Ini
                </p>
                <h2
                  className="mt-1 text-2xl font-black text-white"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  Fresh & Lezat<br />Setiap Hari! 🔥
                </h2>
                <p className="mt-1.5 text-xs text-white/75">
                  Bahan segar, dimasak langsung untuk kamu
                </p>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="mt-4 rounded-full bg-white px-4 py-1.5 text-xs font-bold"
                  style={{ color: brand.primaryColor }}
                >
                  Lihat Menu →
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mx-4 mt-4 grid grid-cols-4 gap-3">
              {[
                { icon: "🍽️", label: "Menu", onClick: () => setActiveTab("menu") },
                { icon: "⭐", label: "Favorit", onClick: () => setActiveTab("menu") },
                { icon: "🔥", label: "Promo", onClick: () => setActiveTab("menu") },
                { icon: "📦", label: "Paket", onClick: () => setActiveTab("menu") },
              ].map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    {icon}
                  </div>
                  <span className="text-[11px] font-medium text-gray-600">{label}</span>
                </button>
              ))}
            </div>

            {/* Featured items */}
            {featuredItems.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between px-4">
                  <h3 className="font-bold text-[#1A0F0A]">Menu Unggulan ⭐</h3>
                  <button
                    onClick={() => setActiveTab("menu")}
                    className="text-xs font-medium"
                    style={{ color: brand.primaryColor }}
                  >
                    Lihat semua
                  </button>
                </div>
                <div
                  className="flex gap-3 overflow-x-auto px-4 pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {featuredItems.map((item) => (
                    <FeaturedCard
                      key={item.id}
                      item={item}
                      brand={brand}
                      qty={getQty(item.id)}
                      onAdd={() => addItem(item)}
                      onDec={() => updateQuantity(item.id, getQty(item.id) - 1)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Menu preview */}
            <div className="mx-4 mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-[#1A0F0A]">Semua Menu</h3>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="text-xs font-medium"
                  style={{ color: brand.primaryColor }}
                >
                  Lihat semua
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-10">
                  <div
                    className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200"
                    style={{ borderTopColor: brand.primaryColor }}
                  />
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
                    {availableItems.slice(0, 5).map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        brand={brand}
                        qty={getQty(item.id)}
                        onAdd={() => addItem(item)}
                        onDec={() => updateQuantity(item.id, getQty(item.id) - 1)}
                      />
                    ))}
                    {availableItems.length === 0 && (
                      <div className="flex flex-col items-center gap-2 py-12">
                        <span className="text-3xl">🍽️</span>
                        <p className="text-sm text-gray-400">Belum ada menu tersedia</p>
                      </div>
                    )}
                  </div>
                  {availableItems.length > 5 && (
                    <button
                      onClick={() => setActiveTab("menu")}
                      className="mt-3 w-full rounded-xl border py-3 text-sm font-semibold"
                      style={{ borderColor: brand.primaryColor, color: brand.primaryColor }}
                    >
                      + {availableItems.length - 5} menu lainnya
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MENU ── */}
        {activeTab === "menu" && (
          <div>
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
              <div
                className="flex gap-2 overflow-x-auto px-4 py-3"
                style={{ scrollbarWidth: "none" }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                    style={
                      activeCategory === cat
                        ? { backgroundColor: brand.primaryColor, color: "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200"
                  style={{ borderTopColor: brand.primaryColor }}
                />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <span className="text-4xl">🍽️</span>
                <p className="text-sm text-gray-400">Belum ada menu tersedia</p>
              </div>
            ) : (
              <div className="mx-4 my-4 divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white px-4 shadow-sm">
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    brand={brand}
                    qty={getQty(item.id)}
                    onAdd={() => addItem(item)}
                    onDec={() => updateQuantity(item.id, getQty(item.id) - 1)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── KERANJANG ── */}
        {activeTab === "keranjang" && (
          <div className="mx-4 mt-4 pb-6">
            <h2 className="mb-4 text-lg font-bold text-[#1A0F0A]">Keranjang</h2>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-20 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                  🛒
                </div>
                <p className="text-sm font-medium text-gray-500">Keranjang masih kosong</p>
                <button
                  onClick={() => setActiveTab("menu")}
                  className="rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: brand.primaryColor }}
                >
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
                          <img
                            src={menuItem.imageUrl}
                            alt={menuItem.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">🍽️</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1A0F0A]">
                          {menuItem.name}
                        </p>
                        <p className="mt-0.5 text-sm font-bold" style={{ color: brand.primaryColor }}>
                          {formatRupiah(menuItem.price)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                          onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border-2"
                          style={{ borderColor: brand.primaryColor }}
                        >
                          <Minus size={11} style={{ color: brand.primaryColor }} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold text-[#1A0F0A]">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addItem(menuItem)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: brand.primaryColor }}
                        >
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
                    <span className="text-lg font-black" style={{ color: brand.primaryColor }}>
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearCart}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Kosongkan
                  </button>
                  <Link href="/checkout" className="flex-1">
                    <button
                      className="w-full rounded-xl py-3 text-sm font-bold text-white"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      Checkout • {formatRupiah(totalPrice)}
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="border-t border-gray-100 bg-white">
        <div className="flex items-center justify-around px-8 py-3">
          {TABS.map(({ tab, Icon, label }) => {
            const isActive = activeTab === tab;
            const showBadge = tab === "keranjang" && totalItems > 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex flex-col items-center gap-1"
              >
                <div className="relative">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                    style={isActive ? { backgroundColor: `${brand.primaryColor}18` } : {}}
                  >
                    <Icon
                      size={21}
                      style={{ color: isActive ? brand.primaryColor : "#9ca3af" }}
                    />
                  </div>
                  {showBadge && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: brand.primaryColor }}
                    >
                      {totalItems}
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: isActive ? brand.primaryColor : "#9ca3af" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
