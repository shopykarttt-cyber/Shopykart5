"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryScrollerProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryScroller({ selectedCategory, onSelectCategory }: CategoryScrollerProps) {
  const db = useFirestore();
  const catQuery = useMemo(() => query(collection(db, "categories"), orderBy("name", "asc")), [db]);
  const { data: categories, loading } = useCollection(catQuery);

  return (
    <div className="py-3 space-y-3">
      <div className="flex overflow-x-auto gap-5 px-6 hide-scrollbar">
        {/* For You Category */}
        <button 
          onClick={() => onSelectCategory("For you")}
          className="flex flex-col items-center gap-2 shrink-0 group"
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
            selectedCategory === "For you" ? "bg-[#FFF9C4] ring-2 ring-[#FFD54F]" : "bg-[#FFF9C4] group-hover:scale-105"
          )}>
            <Heart className="w-8 h-8 text-red-500 fill-current" />
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-tight text-center max-w-[64px]",
            selectedCategory === "For you" ? "text-gray-900" : "text-gray-600"
          )}>
            For you
          </span>
        </button>

        {/* Dynamic Categories */}
        {categories && categories.map((cat: any) => (
          <button 
            key={cat.id} 
            onClick={() => onSelectCategory(cat.name)}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className={cn(
              "w-16 h-16 rounded-full overflow-hidden relative shadow-sm transition-all duration-300 bg-gray-100",
              selectedCategory === cat.name ? "ring-2 ring-primary" : "group-hover:scale-105"
            )}>
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover"
              />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tight text-center max-w-[64px] leading-tight",
              selectedCategory === cat.name ? "text-gray-900" : "text-gray-600"
            )}>
              {cat.name}
            </span>
          </button>
        ))}

        {loading && (
          <div className="flex gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-gray-200" />
                <div className="h-2 w-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
