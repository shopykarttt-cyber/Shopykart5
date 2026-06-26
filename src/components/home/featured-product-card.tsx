
"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FeaturedProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl: string;
  index: number;
}

const bgColors = [
  "bg-[#D3145A]", // Deep Pink/Red
  "bg-[#5B2C91]", // Purple
  "bg-[#0054A6]", // Royal Blue
  "bg-[#006837]", // Dark Green
  "bg-[#E31E24]", // Bright Red
  "bg-[#662D91]", // Violet
  "bg-[#0072BC]", // Blue
];

export function FeaturedProductCard({ id, name, price, mrp, imageUrl, index }: FeaturedProductCardProps) {
  const { addItem } = useCart();
  const bgColor = bgColors[index % bgColors.length];
  
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      unit: "Each",
      imageUrl,
      quantity: 1
    });
    toast({
      title: "Added to Basket",
      description: `${name} is ready for checkout.`,
    });
  };

  return (
    <div 
      onClick={handleAddToCart}
      className={cn(
        "relative w-[180px] h-[260px] rounded-[2rem] flex flex-col items-center p-3 cursor-pointer transition-transform active:scale-95 shadow-lg",
        bgColor
      )}
    >
      {/* Top Rated Badge Area */}
      <div className="w-full flex flex-col items-center mb-1">
        <div className="relative bg-[#FFD700] px-3 py-1 rounded-md shadow-inner border-2 border-black/10 flex flex-col items-center">
          <div className="flex gap-0.5 mb-[-2px]">
            <Star className="w-2 h-2 fill-black text-black" />
            <Star className="w-2 h-2 fill-black text-black" />
            <Star className="w-2 h-2 fill-black text-black" />
          </div>
          <span className="text-[10px] font-black text-black leading-none uppercase tracking-tighter">
            TOP RATED
          </span>
        </div>
        <h4 className="text-white text-[11px] font-bold mt-1 text-center line-clamp-1 w-full px-1">
          {name}
        </h4>
      </div>

      {/* Image Container */}
      <div className="flex-1 w-full bg-white rounded-[1.5rem] mt-1 relative overflow-hidden flex items-center justify-center p-2">
        <Image
          src={imageUrl}
          alt={name}
          width={140}
          height={140}
          className="object-contain"
        />
      </div>

      {/* Yellow Offer Bar */}
      <div className="w-full bg-[#FFD700] rounded-xl py-1.5 px-2 mt-2 flex items-center justify-center shadow-md">
        <span className="text-black font-black italic text-[11px] uppercase whitespace-nowrap">
          {discount > 0 ? `Up to ${discount}% OFF` : `From ₹${price}`}
        </span>
      </div>

      {/* Subtle Shine Effect */}
      <div className="absolute top-2 left-4 w-1 h-1 bg-white/40 rounded-full blur-[1px]"></div>
      <div className="absolute top-4 left-2 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
    </div>
  );
}
