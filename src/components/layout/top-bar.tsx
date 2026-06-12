
"use client";

import { MapPin, Search, Bell, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <div className="px-6 pt-4 pb-2 space-y-4 sticky top-0 bg-white z-40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-primary/10 p-2 rounded-full">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Delivery to</span>
            <span className="text-sm font-semibold flex items-center gap-1 group-hover:text-primary transition-colors">
              Downtown, New York
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 relative">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">2</span>
          </Button>
        </div>
      </div>
      
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Search products, recipes..." 
          className="pl-12 h-14 bg-gray-50 border-none rounded-2xl focus-visible:ring-primary focus-visible:bg-white transition-all text-base"
        />
      </div>
    </div>
  );
}
