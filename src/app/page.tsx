
"use client";

import { TopBar } from "@/components/layout/top-bar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BannerSlider } from "@/components/home/banner-slider";
import { CategoryScroller } from "@/components/home/category-scroller";
import { ProductCard } from "@/components/home/product-card";
import { SmartBasketAssistant } from "@/components/ai/smart-basket-assistant";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const POPULAR_PRODUCTS = [
  { id: "p1", name: "Fairtrade Bananas", price: 2.99, unit: "1 kg", discount: "15%", imgId: "product-bananas" },
  { id: "p2", name: "Organic Whole Milk", price: 4.50, unit: "1 L", imgId: "product-milk" },
  { id: "p3", name: "Free Range Eggs", price: 5.25, unit: "12 pcs", discount: "10%", imgId: "product-eggs" },
  { id: "p4", name: "Ripe Hass Avocados", price: 6.00, unit: "2 pcs", imgId: "product-avocado" },
  { id: "p5", name: "Artisan Sourdough", price: 3.80, unit: "500 g", imgId: "product-bread" },
  { id: "p6", name: "Specialty Cold Brew", price: 7.50, unit: "250 ml", imgId: "product-coffee" },
];

export default function Home() {
  return (
    <>
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
    </>
  );
}
