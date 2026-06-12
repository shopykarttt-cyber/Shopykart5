
"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { ChevronRight, Apple, Beef, Coffee, Croissant, Milk, Wine, Cookie, Salad } from "lucide-react";

const CATEGORIES = [
  { name: "Fruits & Veggies", icon: Apple, color: "bg-green-100 text-green-600" },
  { name: "Meat & Poultry", icon: Beef, color: "bg-red-100 text-red-600" },
  { name: "Bakery & Bread", icon: Croissant, color: "bg-orange-100 text-orange-600" },
  { name: "Dairy & Eggs", icon: Milk, color: "bg-blue-100 text-blue-600" },
  { name: "Beverages", icon: Wine, color: "bg-purple-100 text-purple-600" },
  { name: "Coffee & Tea", icon: Coffee, color: "bg-amber-100 text-amber-600" },
  { name: "Snacks & Sweets", icon: Cookie, color: "bg-pink-100 text-pink-600" },
  { name: "Prepared Meals", icon: Salad, color: "bg-emerald-100 text-emerald-600" },
];

export default function MenuPage() {
  return (
    <>
      <TopBar />
      <div className="flex-1 px-6 py-4 space-y-8">
        <h1 className="text-3xl font-bold">Shop by Category</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button key={idx} className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex justify-between items-center group hover:-translate-y-1 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`${cat.color} p-4 rounded-3xl group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-xl text-gray-800">{cat.name}</span>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-primary" />
              </button>
            )
          })}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
