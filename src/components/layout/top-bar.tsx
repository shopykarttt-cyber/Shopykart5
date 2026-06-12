
"use client";

import { MapPin, Search, Bell, ShoppingBag, ChevronDown, Camera, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <div className="bg-black text-white px-6 pt-4 pb-4 space-y-4 sticky top-0 z-40 rounded-b-[2.5rem] shadow-2xl">
      {/* Top Row: Location and Action Icons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-[#1E1E1E] p-2 rounded-2xl shadow-inner">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-white tracking-tight">Ranipur</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[8px] text-gray-500 font-black uppercase tracking-[0.1em]">
              RANIPUR
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-black">2</span>
          </Button>
        </div>
      </div>

      {/* Middle Row: Brand Logo */}
      <div className="flex justify-center">
        <div className="relative inline-flex flex-col items-center px-8 py-2 border border-[#2E2E2E] rounded-[2rem] bg-gradient-to-b from-[#0F0F0F] to-black shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
           <div className="flex items-baseline leading-none">
             <span className="text-xl font-black italic tracking-tighter text-white">GROSI</span>
             <span className="text-xl font-black italic tracking-tighter text-[#D4AF37]">FY</span>
           </div>
           <span className="text-[6px] font-black tracking-[0.4em] text-gray-600 uppercase mt-0.5">
             QUALITY FIRST
           </span>
        </div>
      </div>
      
      {/* Bottom Row: Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors group-focus-within:text-[#D4AF37]" />
        <Input 
          placeholder="Search Products..." 
          className="pl-12 pr-20 h-12 bg-[#1E1E1E] border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-[#3E3E3E] text-white placeholder:text-gray-600 text-sm font-medium"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-500">
          <Camera className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Mic className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}
