
"use client";

import { useMemo } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { Gift, Ticket, Star, ChevronRight, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useUser, useFirestore, useDoc } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";

export default function RewardsPage() {
  const db = useFirestore();
  const { user } = useUser();

  // Fetch real customer points
  const customerRef = useMemo(() => user ? doc(db, "customers", user.uid) : null, [db, user]);
  const { data: customerData, loading: userLoading } = useDoc(customerRef);

  // Fetch real coupons
  const couponsQuery = useMemo(() => query(collection(db, "coupons"), orderBy("createdAt", "desc")), [db]);
  const { data: coupons, loading: couponsLoading } = useCollection(couponsQuery);

  const points = customerData?.rewardPoints || 0;
  const target = 1500;
  const progress = Math.min((points / target) * 100, 100);

  if (userLoading || couponsLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
  );

  return (
    <>
      <TopBar />
      <div className="flex-1 px-6 space-y-8 py-4 pb-32">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">My Rewards</h1>

        <div className="bg-gradient-to-br from-[#FF6B00] to-[#FFD54F] rounded-[2.5rem] p-8 text-white relative overflow-hidden premium-shadow shadow-orange-200">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest italic">Current Balance</p>
                <h2 className="text-6xl font-black italic tracking-tighter flex items-center gap-2">
                  {points}
                  <Star className="w-8 h-8 fill-white stroke-none" />
                </h2>
              </div>
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/90 leading-relaxed italic">
              {points >= target ? "Goal reached! Redeem for mega savings." : `Earn ${target - points} more for bonus perks!`}
            </p>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex flex-col items-center gap-3">
            <div className="bg-blue-50 p-4 rounded-[1.8rem]">
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">{coupons?.length || 0} Coupons</span>
          </div>
          <div className="bg-white p-6 rounded-[2rem] premium-shadow border border-gray-50 flex flex-col items-center gap-3">
            <div className="bg-purple-50 p-4 rounded-[1.8rem]">
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">2 Active Perks</span>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-black text-xl italic uppercase tracking-tighter">Available Offers</h3>
          <div className="space-y-4">
            {coupons && coupons.length > 0 ? (
              coupons.map((coupon: any) => (
                <div key={coupon.id} className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-6 flex justify-between items-center group hover:border-primary transition-all shadow-sm">
                  <div>
                    <h4 className="text-2xl font-black italic tracking-tighter text-gray-900 uppercase">
                      {coupon.discountType === 'fixed' ? `₹${coupon.value} OFF` : `${coupon.value}% OFF`}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {coupon.minOrder > 0 ? `Min order ₹${coupon.minOrder}` : "On all orders"}
                    </p>
                  </div>
                  <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
                    <span className="text-primary font-black italic uppercase tracking-tighter">{coupon.code}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No active coupons</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
