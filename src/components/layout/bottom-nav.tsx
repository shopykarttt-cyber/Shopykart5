
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, ShoppingBag, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Menu", icon: Menu, href: "/menu" },
  { label: "Orders", icon: ShoppingBag, href: "/orders" },
  { label: "Rewards", icon: Gift, href: "/rewards" },
  { label: "Profile", icon: User, href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.03)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 group",
              isActive ? "text-primary" : "text-gray-400"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-colors",
              isActive ? "bg-primary/10" : "group-hover:bg-gray-50"
            )}>
              <Icon className={cn("w-6 h-6", isActive ? "fill-current" : "stroke-2")} />
            </div>
            <span className={cn("text-[10px] font-medium", isActive ? "opacity-100" : "opacity-70")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
