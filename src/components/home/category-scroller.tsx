
"use client";

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "cat1", name: "Fruits", imageId: "category-fruits" },
  { id: "cat2", name: "Veggies", imageId: "category-veggies" },
  { id: "cat3", name: "Dairy", imageId: "category-dairy" },
  { id: "cat4", name: "Bakery", imageId: "category-bakery" },
  { id: "cat5", name: "Drinks", imageId: "hero-banner-1" },
  { id: "cat6", name: "Snacks", imageId: "hero-banner-2" },
];

export function CategoryScroller() {
  return (
    <div className="py-6 space-y-4">
      <div className="px-6 flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Categories</h2>
        <button className="text-primary text-sm font-semibold hover:underline">See all</button>
      </div>
      <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar">
        {CATEGORIES.map((cat) => {
          const img = PlaceHolderImages.find(i => i.id === cat.imageId) || PlaceHolderImages[0];
          return (
            <div key={cat.id} className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer">
              <div className="w-20 h-20 rounded-[1.75rem] bg-gray-50 p-3 premium-shadow transition-all duration-300 group-hover:bg-primary/5 group-hover:-translate-y-1 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={img.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
