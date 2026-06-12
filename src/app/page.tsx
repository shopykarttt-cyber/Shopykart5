
"use client";

import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BannerSlider } from "@/components/home/banner-slider";
import { CategoryScroller } from "@/components/home/category-scroller";
import { ProductCard } from "@/components/home/product-card";
import { SmartBasketAssistant } from "@/components/ai/smart-basket-assistant";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SplashScreen } from "@/components/ui/splash-screen";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useState, useEffect } from "react";

const POPULAR_PRODUCTS = [
  { id: "p1", name: "Fairtrade Bananas", price: 249, unit: "1 kg", discount: "15%", imgId: "product-bananas" },
  { id: "p2", name: "Organic Whole Milk", price: 180, unit: "1 L", imgId: "product-milk" },
  { id: "p3", name: "Free Range Eggs", price: 450, unit: "12 pcs", discount: "10%", imgId: "product-eggs" },
  { id: "p4", name: "Ripe Hass Avocados", price: 899, unit: "2 pcs", imgId: "product-avocado" },
  { id: "p5", name: "Artisan Sourdough", price: 320, unit: "500 g", imgId: "product-bread" },
  { id: "p6", name: "Specialty Cold Brew", price: 550, unit: "250 ml", imgId: "product-coffee" },
];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AuthGuard>
      <TopBar />
      <div className="flex-1 space-y-2">
        <BannerSlider />
        <CategoryScroller />
        <SmartBasketAssistant />
        
        <div className="px-6 pb-12 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold tracking-tight">Popular Products</h2>
            <button className="text-primary text-sm font-semibold hover:underline">View All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {POPULAR_PRODUCTS.map((product) => {
              const img = PlaceHolderImages.find(i => i.id === product.imgId);
              return (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  unit={product.unit}
                  discount={product.discount}
                  imageId={img?.imageUrl || ""}
                />
              )
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
