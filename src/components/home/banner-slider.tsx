
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

  // Fetch top rated products to use as "Featured" items if no banners are added
  const productsQuery = useMemo(() => query(collection(db, "products"), orderBy("createdAt", "desc")), [db]);
  const { data: liveProducts } = useCollection(productsQuery);

  const featuredItems = useMemo(() => {
    if (liveBanners && liveBanners.length > 0) return liveBanners;
    
    // Fallback: If no banners are added in Admin, show Top Rated products as featured bar items
    if (liveProducts) {
      return liveProducts
        .filter((p: any) => p.isTopRated === true)
        .map((p: any) => ({
          id: p.id,
          title: p.name,
          imageUrl: p.imageUrl,
          badge: "FEATURED",
          subText: `Just ₹${p.price}`
        }));
    }

    return [];
  }, [liveBanners, liveProducts]);

  // Only show the slider if we have something to show (removes sample static data)
  if (featuredItems.length === 0) return null;

  return (
    <div className="px-4 pb-8">
      <Carousel
        opts={{
          align: "start",
          loop: featuredItems.length > 2,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {featuredItems.map((item: any, index: number) => (
            <CarouselItem key={item.id || index} className="pl-3 basis-[42%]">
              <div className="relative aspect-[3/4.5] w-full rounded-2xl overflow-hidden shadow-md group border-2 border-white/20">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-white text-[10px] font-black uppercase tracking-tight flex items-center gap-1">
                      {item.badge || "Offer"}
                    </span>
                    <p className="text-white/80 text-[8px] font-bold">{item.subText}</p>
                  </div>
                  <h3 className="text-white text-xs font-black leading-tight uppercase line-clamp-2">
                    {item.title}
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
