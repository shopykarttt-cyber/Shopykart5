
"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { ShoppingBag, ChevronRight, Clock, Package } from "lucide-react";

const ORDERS = [
  { id: "ORD-9281", date: "Today, 2:30 PM", status: "Delivered", items: 12, total: 84.50 },
  { id: "ORD-9120", date: "May 12, 2024", status: "Delivered", items: 5, total: 32.20 },
  { id: "ORD-8992", date: "May 05, 2024", status: "Delivered", items: 8, total: 45.10 },
];

export default function OrdersPage() {
  return (
    <>
      <TopBar />
      <div className="flex-1 px-6 space-y-8 py-4">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        
        <div className="space-y-4">
          <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">Ongoing Delivery</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Arriving in</span>
                <span className="text-primary">12-15 mins</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-[65%] h-full bg-primary animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Order History</h3>
            <div className="space-y-4">
              {ORDERS.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex justify-between items-center group cursor-pointer hover:border-primary/20 transition-all">
                  <div className="flex gap-4">
                    <div className="bg-gray-50 p-3 rounded-2xl">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{order.id}</h4>
                      <p className="text-xs text-gray-500 font-medium">{order.date}</p>
                      <p className="text-xs text-primary font-bold mt-1">${order.total.toFixed(2)} • {order.items} items</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
