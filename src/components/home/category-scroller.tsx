
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
    <div className="pt-4 pb-1">
      <div className="flex overflow-x-auto gap-4 px-6 hide-scrollbar pb-2">
        {/* For You Category */}
        <button 
          onClick={() => onSelectCategory("For you")}
          className="flex flex-col items-center gap-2 shrink-0 group relative min-w-[70px]"
        >
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
            selectedCategory === "For you" ? "bg-white ring-2 ring-white" : "bg-white"
          )}>
            <div className="bg-red-500 p-2 rounded-full">
              <Heart className="w-7 h-7 text-white fill-current" />
            </div>
          </div>
          <span className={cn(
            "text-[11px] font-bold text-center leading-tight transition-all",
            selectedCategory === "For you" ? "text-black" : "text-gray-800"
          )}>
            For you
          </span>
          {selectedCategory === "For you" && (
            <div className="absolute -bottom-1 w-12 h-1 bg-black rounded-full" />
          )}
        </button>

        {/* Dynamic Categories */}
        {categories && categories.map((cat: any) => (
          <button 
            key={cat.id} 
            onClick={() => onSelectCategory(cat.name)}
            className="flex flex-col items-center gap-2 shrink-0 group relative min-w-[80px]"
          >
            <div className={cn(
              "w-16 h-16 rounded-full overflow-hidden relative shadow-sm transition-all duration-300",
              selectedCategory === cat.name ? "bg-white ring-2 ring-white" : "bg-white"
            )}>
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                className="object-cover p-1 rounded-full"
              />
            </div>
            <span className={cn(
              "text-[11px] font-bold text-center leading-tight px-1",
              selectedCategory === cat.name ? "text-black" : "text-gray-800"
            )}>
              {cat.name}
            </span>
            {selectedCategory === cat.name && (
              <div className="absolute -bottom-1 w-12 h-1 bg-black rounded-full" />
            )}
          </button>
        ))}

        {loading && (
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-white/50" />
                <div className="h-2 w-10 bg-white/50 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
