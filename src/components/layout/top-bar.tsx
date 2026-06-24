
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { MapPin, Search, Bell, ShoppingBag, ChevronDown, Camera, Mic, Home, Menu as MenuIcon, Gift, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/menu", icon: MenuIcon },
    { label: "Orders", href: "/orders", icon: ShoppingBag },
    { label: "Rewards", href: "/rewards", icon: Gift },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="bg-black text-white px-6 pt-4 pb-4 space-y-4 sticky top-0 z-40 md:rounded-t-[3rem] shadow-2xl">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
        {/* Logo Section - Desktop Left */}
        <div 
          onClick={() => router.push('/')}
          className="relative cursor-pointer select-none flex flex-col items-center px-4 py-1 border border-[#2E2E2E] rounded-[1.2rem] bg-gradient-to-b from-[#0F0F0F] to-black shadow-lg hover:scale-105 transition-transform"
        >
           <div className="flex items-baseline leading-none">
             <span className="text-xl font-black italic tracking-tighter text-white uppercase">GROSI</span>
             <span className="text-xl font-black italic tracking-tighter text-primary uppercase">FY</span>
           </div>
           <span className="text-[5px] font-black tracking-[0.3em] text-gray-600 uppercase">
             QUALITY FIRST
           </span>
        </div>

        {/* Navigation - Desktop Center */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-2 font-bold text-sm transition-colors uppercase tracking-widest",
                pathname === item.href ? "text-primary" : "text-gray-400 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 group cursor-pointer mr-4">
            <MapPin className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white uppercase leading-none">Ranipur</span>
              <span className="text-[6px] text-gray-500 uppercase font-black">Delivery</span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white">
            <Bell className="w-5 h-5" />
          </Button>
          
          <CartSheet>
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-[#1E1E1E] hover:bg-[#2E2E2E] text-white relative">
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black animate-in zoom-in">
                  {items.length}
                </span>
              )}
            </Button>
          </CartSheet>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto w-full relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-primary" />
        <Input 
          placeholder="Search for fresh groceries, organic milk, bakery..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="pl-12 pr-16 h-12 bg-[#1E1E1E] border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-[#3E3E3E] text-white placeholder:text-gray-600 text-sm font-medium"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-500">
          <Camera className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Mic className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}
