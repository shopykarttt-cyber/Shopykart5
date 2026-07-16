
"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  unit: string;
  imageId: string;
  category?: string;
  discount?: string;
}

export function ProductCard({ id, name, price, unit, imageId }: ProductCardProps) {
  const { items, addItem, removeItem, updateQuantity } = useCart();
  
  const cartItem = items.find(i => i.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;

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
    <Card className="border border-orange-50/50 bg-white rounded-[3.5rem] p-8 flex flex-row items-center justify-between group transition-all duration-300 shadow-sm hover:shadow-md w-full relative overflow-visible">
      <div className="flex-1 pr-6">
        <h3 className="font-black text-xl text-gray-800 italic uppercase leading-tight line-clamp-2 tracking-tighter">
          {name}
        </h3>
        <p className="text-4xl font-black text-primary italic mt-2 tracking-tighter">
          ₹{price}
        </p>
      </div>

      <div className="relative shrink-0 flex flex-col items-center">
        <div className="w-28 h-28 rounded-[2rem] overflow-hidden relative border border-gray-100 shadow-inner bg-white">
          <Image
            src={imageId}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Add Button / Quantity Selector */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
          {quantity > 0 ? (
            <div className="bg-white border-2 border-primary h-12 px-2 rounded-2xl shadow-xl flex items-center justify-between gap-4 min-w-[110px] animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  quantity === 1 ? removeItem(id) : updateQuantity(id, -1);
                }} 
                className="text-primary p-1 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Minus className="w-5 h-5 stroke-[4px]" />
              </button>
              <span className="font-black text-primary text-base w-4 text-center">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(id, 1);
                }} 
                className="text-primary p-1 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Plus className="w-5 h-5 stroke-[4px]" />
              </button>
            </div>
          ) : (
            <Button 
              onClick={handleAddToCart}
              className="bg-white hover:bg-white text-primary border-2 border-primary h-12 px-8 rounded-2xl font-black text-sm uppercase shadow-xl flex items-center gap-1 transition-all active:scale-95"
            >
              ADD
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
