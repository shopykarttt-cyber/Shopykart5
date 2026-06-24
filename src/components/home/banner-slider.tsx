"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export function BannerSlider() {
  const db = useFirestore();
  const bannersQuery = useMemo(() => query(collection(db, "banners"), orderBy("createdAt", "desc")), [db]);
  const { data: liveBanners, loading } = useCollection(bannersQuery);

  const defaultBanners = [
    { 
      id: "default-1", 
      title: "Grocery Match", 
      imageUrl: "https://picsum.photos/seed/grocerymatch/400/600",
      badge: "WIN 150",
      subText: "Play Now"
    },
    { 
      id: "default-2", 
      title: "Super Loot Deals", 
      imageUrl: "https://picsum.photos/seed/loot1/400/600",
      badge: "From ₹179",
      subText: "Men's Shirts"
    },
    { 
      id: "default-3", 
      title: "Super Loot Deals", 
      imageUrl: "https://picsum.photos/seed/loot2/400/600",
      badge: "From ₹99",
      subText: "School Needs"
    }
  ];

  const bannersToShow = liveBanners && liveBanners.length > 0 ? liveBanners : defaultBanners;

  return (
    <div className="bg-[#FFD54F] px-4 pb-6">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {bannersToShow.map((banner: any, index: number) => (
            <CarouselItem key={banner.id || index} className="pl-3 basis-[42%]">
              <div className="relative aspect-[3/4.5] w-full rounded-2xl overflow-hidden shadow-md group border-2 border-white/20">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-white text-[10px] font-black uppercase tracking-tight flex items-center gap-1">
                      {banner.badge || "Offer"}
                    </span>
                    <p className="text-white/80 text-[8px] font-bold">{banner.subText}</p>
                  </div>
                  <h3 className="text-white text-xs font-black leading-tight uppercase">
                    {banner.title}
                  </h3>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
