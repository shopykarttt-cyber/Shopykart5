
"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { Gift, Ticket, Star, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RewardsPage() {
  return (
    <>
      <TopBar />
      <div className="flex-1 px-6 space-y-8 py-4">
        <h1 className="text-3xl font-bold">Rewards</h1>

        <div className="bg-gradient-to-br from-accent to-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden premium-shadow">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-white/80 text-sm font-medium">Your Balance</p>
                <h2 className="text-5xl font-bold flex items-center gap-2">
                  1,250
                  <Star className="w-8 h-8 fill-white stroke-none" />
                </h2>
              </div>
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </div>
            </div>
            <p className="text-sm font-medium text-white/90 leading-relaxed">
              You're only 250 points away from your next free delivery!
            </p>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="w-[80%] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex flex-col items-center gap-3">
            <div className="bg-blue-50 p-4 rounded-[1.5rem]">
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
            <span className="font-bold text-gray-800">4 Coupons</span>
          </div>
          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex flex-col items-center gap-3">
            <div className="bg-purple-50 p-4 rounded-[1.5rem]">
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
            <span className="font-bold text-gray-800">2 Surprises</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-xl">Active Offers</h3>
          <div className="space-y-4">
            {[
              { title: "$10.00 Off", desc: "Minimum order of $50.00", code: "RUBY10" },
              { title: "Free Delivery", desc: "On any fresh produce order", code: "FREESHIP" },
            ].map((coupon, i) => (
              <div key={i} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex justify-between items-center group hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{coupon.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{coupon.desc}</p>
                </div>
                <Button variant="outline" className="rounded-xl border-primary text-primary font-bold hover:bg-primary hover:text-white">
                  {coupon.code}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
