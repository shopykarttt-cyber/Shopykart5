
"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  unit: string;
  imageId: string;
  discount?: string;
}

export function ProductCard({ id, name, price, unit, imageId, discount }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      unit,
      imageUrl: imageId,
      quantity: 1
    });
    toast({
      title: "Added to Basket",
      description: `${name} is ready for checkout.`,
      duration: 2000
    });
  };

  return (
    <Card className="border-none bg-white premium-shadow rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-square w-full bg-gray-50 p-4">
        {discount && (
          <Badge className="absolute top-4 left-4 z-10 bg-primary hover:bg-primary font-bold rounded-lg px-2 py-0.5">
            {discount} OFF
          </Badge>
        )}
        <Image
          src={imageId}
          alt={name}
          fill
          className="object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-base text-gray-800 line-clamp-1">{name}</h3>
          <p className="text-xs text-gray-500 font-medium">{unit}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">₹{price.toFixed(0)}</span>
          </div>
          <Button 
            onClick={handleAddToCart}
            size="icon" 
            className="w-10 h-10 rounded-2xl bg-primary hover:bg-accent premium-shadow transition-all"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
