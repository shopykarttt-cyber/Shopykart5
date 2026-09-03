
"use client";

import { useMemo } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";
import { ShoppingBag, ChevronRight, Clock, Package, Loader2 } from "lucide-react";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const db = useFirestore();
  const { user } = useUser();

  // Query to fetch orders only for the current logged-in customer
  const ordersQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, "orders"),
      where("customerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: orders, loading } = useCollection(ordersQuery);

  // Filter ongoing (Processing) vs past orders
  const ongoingOrders = useMemo(() => 
    orders?.filter(o => o.status === "Processing") || [], 
    [orders]
  );
  
  const historyOrders = useMemo(() => 
    orders?.filter(o => o.status !== "Processing") || [], 
    [orders]
  );

  return (
    <>
      <TopBar />
      <div className="flex-1 px-6 space-y-8 py-4 pb-32 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Your Orders</h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Syncing Orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
            <div className="bg-gray-50 w-24 h-24 rounded-[3rem] flex items-center justify-center border border-gray-100">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Basket is Empty</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">You haven't placed any orders yet</p>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Ongoing Deliveries */}
            {ongoingOrders.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.3em] px-2 italic">Ongoing Delivery</h3>
                {ongoingOrders.map((order: any) => (
                  <div key={order.id} className="bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 uppercase italic tracking-tighter text-lg">Arriving Soon</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">ID: {order.id?.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-primary font-black italic text-2xl tracking-tighter">₹{order.total}</span>
                        <p className="text-[8px] font-black text-primary/60 uppercase">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-400 italic">Estimated Arrival</span>
                        <span className="text-primary">12-15 mins</span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-primary/5 shadow-inner">
                        <div className="w-[65%] h-full bg-primary animate-pulse rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History Section */}
            <div className="space-y-4">
              <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.3em] px-2 italic">Order History</h3>
              <div className="space-y-4">
                {historyOrders.map((order: any) => (
                  <div 
                    key={order.id} 
                    className="bg-white p-6 rounded-[2.5rem] premium-shadow border border-gray-50 flex justify-between items-center group cursor-pointer hover:border-primary/20 transition-all duration-500 active:scale-[0.98]"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="bg-gray-50 p-4 rounded-[1.8rem] group-hover:bg-primary/5 transition-colors border border-gray-100/50">
                        <Package className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-gray-800 uppercase italic tracking-tighter text-base">ORD-{order.id?.slice(-6).toUpperCase()}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter leading-none">
                          {order.createdAt?.toDate ? format(order.createdAt.toDate(), "MMM dd, hh:mm a") : "Just now"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-black italic text-primary">₹{order.total}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{order.items?.length || 0} items</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <div className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border",
                            order.status === 'Delivered' 
                              ? 'bg-green-50 text-green-600 border-green-100' 
                              : order.status === 'Cancelled' 
                              ? 'bg-red-50 text-red-500 border-red-100'
                              : 'bg-blue-50 text-blue-500 border-blue-100'
                          )}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
                
                {historyOrders.length === 0 && ongoingOrders.length > 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No past history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
