
"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Settings, CreditCard, Heart, MapPin, ShieldCheck, HelpCircle, LogOut } from "lucide-react";

export default function ProfilePage() {
  const menuItems = [
    { icon: Heart, label: "Favorites", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: MapPin, label: "Addresses", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: CreditCard, label: "Payments", color: "text-green-500", bg: "bg-green-50" },
    { icon: ShieldCheck, label: "Privacy & Security", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: HelpCircle, label: "Help Center", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Settings, label: "Settings", color: "text-gray-500", bg: "bg-gray-50" },
  ];

  return (
    <>
      <div className="flex-1 space-y-8 pb-12">
        <div className="bg-primary pt-16 pb-12 px-8 rounded-b-[4rem] text-white flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8"></div>
          <Avatar className="w-24 h-24 border-4 border-white/20 premium-shadow">
            <AvatarImage src="https://picsum.photos/seed/user/200/200" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1 z-10">
            <h2 className="text-2xl font-bold">Julian Smith</h2>
            <p className="text-white/80 font-medium">julian.smith@example.com</p>
          </div>
        </div>

        <div className="px-6 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button key={idx} className="bg-white p-5 rounded-[2rem] premium-shadow flex items-center justify-between group transition-all hover:bg-gray-50 active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className={`${item.bg} p-3 rounded-2xl`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <span className="font-bold text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                </button>
              );
            })}
            
            <button className="bg-red-50 p-5 rounded-[2rem] flex items-center justify-between group transition-all hover:bg-red-100 mt-4">
              <div className="flex items-center gap-4">
                <div className="bg-red-500/10 p-3 rounded-2xl">
                  <LogOut className="w-6 h-6 text-red-500" />
                </div>
                <span className="font-bold text-red-500">Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
