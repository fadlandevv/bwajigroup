"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, exact: false },
  { label: "Menu", href: "/admin/menu", icon: UtensilsCrossed, exact: false },
  { label: "Chat", href: "/admin/chat", icon: MessageSquare, exact: false },
  { label: "Profile", href: "/admin/profile", icon: User, exact: false },
];

interface Props {
  brandLabel?: string | null;
}

export function AdminMobileNav({ brandLabel }: Props) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-gray-200 bg-white md:hidden">
      {brandLabel && (
        <div className="flex items-center justify-center border-b border-gray-100 py-1">
          <span className="text-[10px] font-semibold text-orange-500">{brandLabel}</span>
        </div>
      )}
      <div className="flex h-14 items-center">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-orange-500" : "text-gray-400"
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
