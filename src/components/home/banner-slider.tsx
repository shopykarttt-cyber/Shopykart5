
"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

export function BannerSlider() {
  const banners = PlaceHolderImages.filter(img => img.id.startsWith("hero-banner"));

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
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id} className="pl-4">
              <div className="relative h-48 w-full rounded-[2rem] overflow-hidden premium-shadow group">
                <Image
                  src={banner.imageUrl}
                  alt={banner.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  data-ai-hint={banner.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center p-8">
                  <span className="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">Exclusive Offer</span>
                  <h3 className="text-white text-2xl font-bold max-w-[60%] mb-4 leading-tight">
                    Get 50% Off on Fresh Fruits
                  </h3>
                  <Button className="w-fit bg-primary hover:bg-accent text-white rounded-xl font-semibold px-6">
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
