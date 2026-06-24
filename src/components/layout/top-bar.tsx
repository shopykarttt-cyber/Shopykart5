"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/components/cart/cart-provider";

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
    <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF9E00] px-5 pt-3 pb-3 sticky top-0 z-40 md:rounded-t-[2.5rem] shadow-md">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10 h-10 bg-white border-none rounded-full focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 text-xs font-medium shadow-sm"
          />
        </div>

        {/* Points Indicator */}
        <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white fill-current" />
          </div>
          <span className="text-white font-black text-xs">28</span>
        </div>

        {/* Cart Action */}
        <CartSheet>
          <button className="relative p-1.5 text-white hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6 stroke-[1.5px]" />
            {items.length > 0 && (
              <span className="absolute top-0 right-0 bg-white text-[#FF6B00] text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-lg border border-white">
                {items.length}
              </span>
            )}
          </button>
        </CartSheet>
      </div>
    </div>
  );
}
