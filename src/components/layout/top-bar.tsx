
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Bell, ShoppingBag, ChevronDown, Camera, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="bg-black text-white px-6 pt-3 pb-3 space-y-2 sticky top-0 z-40 rounded-b-[2rem] shadow-2xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-[#1E1E1E] p-1.5 rounded-xl shadow-inner">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-white tracking-tight leading-none">Ranipur</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <span className="text-[7px] text-gray-500 font-black uppercase tracking-[0.1em] mt-0.5">
              RANIPUR
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white">
            <Bell className="w-4 h-4" />
          </Button>
          <CartSheet>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white relative">
              <ShoppingBag className="w-4 h-4" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-black animate-in zoom-in">
                  {items.length}
                </span>
              )}
            </Button>
          </CartSheet>
        </div>
      </div>

      <div className="flex justify-center">
        <div 
          onClick={() => router.push('/')}
          className="relative cursor-pointer select-none inline-flex flex-col items-center px-6 py-1 border border-[#2E2E2E] rounded-[1.5rem] bg-gradient-to-b from-[#0F0F0F] to-black shadow-[0_5px_15px_rgba(0,0,0,0.6)] active:scale-95 transition-transform"
        >
           <div className="flex items-baseline leading-none">
             <span className="text-lg font-black italic tracking-tighter text-white uppercase">GROSI</span>
             <span className="text-lg font-black italic tracking-tighter text-primary uppercase">FY</span>
           </div>
           <span className="text-[5px] font-black tracking-[0.3em] text-gray-600 uppercase mt-0.5">
             QUALITY FIRST
           </span>
        </div>
      </div>
      
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Search Products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="pl-10 pr-16 h-10 bg-[#1E1E1E] border-none rounded-xl focus-visible:ring-1 focus-visible:ring-[#3E3E3E] text-white placeholder:text-gray-600 text-xs font-medium"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
          <Camera className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <Mic className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}
