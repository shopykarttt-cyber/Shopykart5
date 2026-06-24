
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingBag, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

export function TopBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { items } = useCart();

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.toLowerCase().trim();
      if (query === 'admin/dashboard') {
        router.push('/admin');
        setSearchQuery("");
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] px-6 pt-6 pb-6 sticky top-0 z-40 md:rounded-t-[3rem] shadow-lg">
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-12 h-12 bg-white border-none rounded-full focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 text-sm font-medium shadow-sm"
          />
        </div>

        {/* Points Indicator */}
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <div className="w-5 h-5 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full flex items-center justify-center">
            <Zap className="w-3 h-3 text-white fill-current" />
          </div>
          <span className="text-white font-black text-sm">28</span>
        </div>

        {/* Cart Action */}
        <CartSheet>
          <button className="relative p-2 text-white hover:scale-110 transition-transform">
            <ShoppingBag className="w-7 h-7 stroke-[1.5px]" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-white text-[#FF6B00] text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-white">
                {items.length}
              </span>
            )}
          </button>
        </CartSheet>
      </div>
    </div>
  );
}
