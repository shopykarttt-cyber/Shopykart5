
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
      title: "Get 50% Off on Fresh Fruits", 
      imageUrl: "https://picsum.photos/seed/grocery1/1200/600",
      link: "#"
    },
    { 
      id: "default-2", 
      title: "Premium Bakery Selection", 
      imageUrl: "https://picsum.photos/seed/bakery/1200/600",
      link: "#"
    }
  ];

  const bannersToShow = liveBanners && liveBanners.length > 0 ? liveBanners : defaultBanners;

  return (
    <div className="px-6 mt-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {bannersToShow.map((banner: any, index: number) => (
            <CarouselItem key={banner.id || index} className="pl-4">
              <div className="relative h-48 w-full rounded-[2rem] overflow-hidden premium-shadow group">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center p-8">
                  <span className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-2">Exclusive Offer</span>
                  <h3 className="text-white text-2xl font-black italic max-w-[70%] mb-4 leading-none uppercase">
                    {banner.title}
                  </h3>
                  <Button className="w-fit bg-primary hover:bg-accent text-white rounded-xl font-black italic uppercase px-6 h-10 shadow-lg">
                    Shop Now
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
