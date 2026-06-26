
"use client";

import { useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export function BannerSlider() {
  const db = useFirestore();
  
  // Fetch actual banners from admin
  const bannersQuery = useMemo(() => query(collection(db, "banners"), orderBy("createdAt", "desc")), [db]);
  const { data: liveBanners } = useCollection(bannersQuery);

  const featuredItems = useMemo(() => {
    // Only show banners if they actually exist in Firestore
    if (liveBanners && liveBanners.length > 0) return liveBanners;
    return [];
  }, [liveBanners]);

  // If no banners are added in Admin, hide the section entirely
  if (featuredItems.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <Carousel
        opts={{
          align: "start",
          loop: featuredItems.length > 2,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {featuredItems.map((item: any, index: number) => (
            <CarouselItem key={item.id || index} className="pl-3 basis-[90%] sm:basis-[45%]">
              <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-md group border border-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.title && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                    <h3 className="text-white text-sm font-black leading-tight uppercase">
                      {item.title}
                    </h3>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
